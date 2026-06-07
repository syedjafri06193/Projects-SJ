"""
Inference module for the Image Captioning System.

CaptionPredictor loads trained weights and runs:
    1. OpenCV preprocessing (resize, normalize)
    2. InceptionV3 feature extraction
    3. Beam search decoding (k=3)

Usage:
    from src.predict import CaptionPredictor
    from PIL import Image

    predictor = CaptionPredictor("models/checkpoints/best_model.h5", "models/tokenizer.pkl")
    results = predictor.predict(Image.open("photo.jpg"))
    # [{"rank": 1, "text": "...", "confidence": 0.91}, ...]
"""

import pickle
import heapq
import math
import logging
from typing import Optional

import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from tensorflow import keras

import config
from src.model import CNNEncoder, LSTMDecoder

logger = logging.getLogger(__name__)


class BeamHypothesis:
    """Single hypothesis in beam search."""

    __slots__ = ("tokens", "log_prob", "states")

    def __init__(self, tokens: list[int], log_prob: float, states):
        self.tokens   = tokens
        self.log_prob = log_prob
        self.states   = states

    def score(self, length_penalty: float = config.LENGTH_PENALTY) -> float:
        """Length-normalized log probability."""
        lp = ((5 + len(self.tokens)) / 6) ** length_penalty
        return self.log_prob / lp

    def __lt__(self, other):
        return self.score() < other.score()


class CaptionPredictor:
    """
    Loads a trained ImageCaptioner and generates captions via beam search.

    Args:
        model_path:     Path to saved model weights (.h5).
        tokenizer_path: Path to pickled Keras Tokenizer.
    """

    def __init__(self, model_path: str, tokenizer_path: str):
        self.tokenizer = self._load_tokenizer(tokenizer_path)
        self.encoder, self.decoder = self._load_model(model_path)

        # Cache token IDs
        wi = self.tokenizer.word_index
        self.start_id = wi.get(config.START_TOKEN.strip("<>"), 1)
        self.end_id   = wi.get(config.END_TOKEN.strip("<>"),   2)
        self.idx2word = {v: k for k, v in wi.items()}

    # ── Private helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _load_tokenizer(path: str):
        with open(path, "rb") as f:
            return pickle.load(f)

    def _load_model(self, weights_path: str):
        encoder = CNNEncoder(embed_dim=config.EMBED_DIM)
        decoder = LSTMDecoder(
            vocab_size=config.VOCAB_SIZE,
            embed_dim=config.EMBED_DIM,
            lstm_units=config.LSTM_UNITS,
        )
        # Warm-up to build variable shapes
        dummy_img  = tf.zeros((1, *config.IMAGE_SIZE, config.IMAGE_CHANNELS))
        dummy_feat = encoder(dummy_img)
        dummy_tok  = tf.zeros((1,), dtype=tf.int32)
        states     = decoder.initial_states(1)
        decoder(dummy_tok, dummy_feat, states)

        # Load weights into a temporary combined model to get named weights
        from src.model import ImageCaptioner
        captioner = ImageCaptioner()
        captioner.load_weights(weights_path)

        # Copy weights to standalone encoder/decoder
        encoder.set_weights(captioner.encoder.get_weights())
        decoder.set_weights(captioner.decoder.get_weights())

        logger.info(f"Weights loaded from {weights_path}")
        return encoder, decoder

    # ── Preprocessing ──────────────────────────────────────────────────────────

    def _preprocess(self, pil_img: Image.Image) -> tf.Tensor:
        """PIL Image → (1, 224, 224, 3) float32 tensor normalized to [0,1]."""
        img = np.array(pil_img.convert("RGB"))
        img = cv2.resize(img, config.IMAGE_SIZE, interpolation=cv2.INTER_AREA)
        img = img.astype(np.float32) / 255.0
        return tf.expand_dims(img, 0)   # (1, 224, 224, 3)

    # ── Feature extraction ─────────────────────────────────────────────────────

    def _extract_features(self, img_tensor: tf.Tensor) -> tf.Tensor:
        return self.encoder(img_tensor, training=False)   # (1, embed_dim)

    # ── Beam search ────────────────────────────────────────────────────────────

    def _beam_search(
        self,
        features: tf.Tensor,
        beam_width: int = config.BEAM_WIDTH,
        max_len: int    = config.MAX_CAPTION_LEN,
        top_k: int      = config.TOP_K_CAPTIONS,
    ) -> list[dict]:
        """
        Beam search decoder.

        Args:
            features:   (1, embed_dim) CNN feature vector
            beam_width: Number of beams to maintain
            max_len:    Maximum number of tokens to generate
            top_k:      Number of completed hypotheses to return

        Returns:
            List of dicts sorted by score (best first):
                [{"rank": 1, "text": "...", "confidence": 0.91}, ...]
        """
        init_states = self.decoder.initial_states(1)

        # Seed: single hypothesis with <start> token
        active = [
            BeamHypothesis(
                tokens=[self.start_id],
                log_prob=0.0,
                states=init_states,
            )
        ]
        completed: list[BeamHypothesis] = []

        for _ in range(max_len):
            if not active:
                break
            candidates: list[BeamHypothesis] = []

            for hyp in active:
                token_id = tf.constant([[hyp.tokens[-1]]], dtype=tf.int32)
                logits, new_states, _ = self.decoder(
                    token_id[:, 0], features, hyp.states, training=False
                )
                log_probs = tf.nn.log_softmax(logits[0]).numpy()   # (vocab_size,)

                # Expand top beam_width tokens
                top_ids = np.argsort(log_probs)[-beam_width:]
                for token in top_ids:
                    new_log_prob = hyp.log_prob + float(log_probs[token])
                    new_hyp = BeamHypothesis(
                        tokens=hyp.tokens + [int(token)],
                        log_prob=new_log_prob,
                        states=new_states,
                    )
                    if int(token) == self.end_id:
                        completed.append(new_hyp)
                    else:
                        candidates.append(new_hyp)

            # Keep top beam_width candidates
            active = heapq.nlargest(beam_width, candidates, key=lambda h: h.score())

        # If no beam completed, use active beams
        if not completed:
            completed = active

        # Sort by score
        completed.sort(key=lambda h: h.score(), reverse=True)
        results = []
        for rank, hyp in enumerate(completed[:top_k], start=1):
            words = [
                self.idx2word.get(t, "")
                for t in hyp.tokens[1:]          # strip <start>
                if t not in (self.end_id, 0)     # strip <end> and <pad>
            ]
            text = " ".join(w for w in words if w)
            # Map log probability to a [0,1] confidence heuristic
            confidence = round(min(1.0, math.exp(hyp.score() / max(len(hyp.tokens), 1))), 4)
            results.append({"rank": rank, "text": text, "confidence": confidence})

        return results

    # ── Public API ─────────────────────────────────────────────────────────────

    def predict(
        self,
        pil_img: Image.Image,
        beam_width: int = config.BEAM_WIDTH,
        top_k: int      = config.TOP_K_CAPTIONS,
    ) -> list[dict]:
        """
        Generate captions for a PIL image.

        Args:
            pil_img:    PIL.Image (any mode — converted to RGB internally).
            beam_width: Beam search width.
            top_k:      How many captions to return.

        Returns:
            Sorted list of caption dicts: [{"rank", "text", "confidence"}, ...]
        """
        img_tensor = self._preprocess(pil_img)
        features   = self._extract_features(img_tensor)
        captions   = self._beam_search(features, beam_width=beam_width, top_k=top_k)
        return captions
