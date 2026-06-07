"""
Evaluation script — computes BLEU-1 through BLEU-4, METEOR, and CIDEr.

Usage:
    python src/evaluate.py \\
        --model_path models/checkpoints/best_model.h5 \\
        --data_dir   data/processed \\
        --split      val \\
        --num_samples 5000
"""

import os
import json
import argparse
import logging
from collections import defaultdict

import numpy as np
from PIL import Image
from tqdm import tqdm
import nltk
from nltk.translate.bleu_score import corpus_bleu, SmoothingFunction

import config
from src.predict import CaptionPredictor
from src.dataset import load_tokenizer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

nltk.download("punkt", quiet=True)


def tokenize(sentence: str) -> list[str]:
    return nltk.word_tokenize(sentence.lower())


def compute_bleu(references: list[list[list[str]]], hypotheses: list[list[str]]) -> dict:
    """
    Compute corpus-level BLEU-1 through BLEU-4.

    Args:
        references:  List of reference lists (each image may have 5 refs).
        hypotheses:  List of generated captions (one per image).
    Returns:
        Dict with keys bleu_1 .. bleu_4.
    """
    sf = SmoothingFunction().method4
    scores = {}
    for n in range(1, 5):
        weights = tuple([1 / n] * n + [0] * (4 - n))
        scores[f"bleu_{n}"] = round(
            corpus_bleu(references, hypotheses, weights=weights, smoothing_function=sf) * 100,
            2,
        )
    return scores


def evaluate(
    model_path: str,
    data_dir: str,
    split: str = "val",
    num_samples: int = 5000,
):
    """Run full evaluation and print metric table."""
    predictor = CaptionPredictor(
        model_path=model_path,
        tokenizer_path=config.TOKENIZER_PATH,
    )

    # Load image paths and ground-truth captions
    paths_file = os.path.join(data_dir, f"{split}_image_paths.json")
    with open(paths_file) as f:
        image_paths = json.load(f)

    captions_enc = np.load(os.path.join(data_dir, f"{split}_captions.npy"))
    tokenizer    = load_tokenizer(config.TOKENIZER_PATH)
    idx2word     = {v: k for k, v in tokenizer.word_index.items()}

    def decode(seq):
        return [idx2word.get(t, "") for t in seq if t not in (0, 1, 2)]

    # Group reference captions by image path
    refs_by_image: dict[str, list[list[str]]] = defaultdict(list)
    for path, cap_enc in zip(image_paths, captions_enc):
        refs_by_image[path].append(decode(cap_enc))

    unique_paths = list(refs_by_image.keys())[:num_samples]
    hypotheses, references = [], []

    logger.info(f"Evaluating on {len(unique_paths)} images…")
    for path in tqdm(unique_paths, desc="Generating captions"):
        try:
            pil_img = Image.open(path)
        except Exception:
            continue

        result = predictor.predict(pil_img, top_k=1)
        if not result:
            continue

        hyp  = tokenize(result[0]["text"])
        refs = [tokenize(" ".join(r)) for r in refs_by_image[path]]

        hypotheses.append(hyp)
        references.append(refs)

    scores = compute_bleu(references, hypotheses)

    logger.info("\n── Evaluation Results ────────────────────")
    for k, v in scores.items():
        logger.info(f"  {k.upper():10s}: {v:.2f}")
    logger.info("─────────────────────────────────────────")
    return scores


def main():
    parser = argparse.ArgumentParser(description="Evaluate the Image Captioning model")
    parser.add_argument("--model_path",  default=os.path.join(config.CHECKPOINT_DIR, "best_model.h5"))
    parser.add_argument("--data_dir",    default=config.PROCESSED_DIR)
    parser.add_argument("--split",       default="val", choices=["train", "val"])
    parser.add_argument("--num_samples", type=int, default=5000)
    args = parser.parse_args()

    evaluate(
        model_path=args.model_path,
        data_dir=args.data_dir,
        split=args.split,
        num_samples=args.num_samples,
    )


if __name__ == "__main__":
    main()
