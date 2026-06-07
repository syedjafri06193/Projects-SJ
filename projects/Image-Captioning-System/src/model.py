"""
Model architecture for the Image Captioning System.

Components
----------
CNNEncoder      — InceptionV3 backbone (pretrained ImageNet, frozen)
BahdanauAttention — Soft attention over CNN spatial features
LSTMDecoder     — Single-layer LSTM with embedding + attention
ImageCaptioner  — Wrapper that composes encoder + decoder
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import config


# ── CNN Encoder ───────────────────────────────────────────────────────────────

class CNNEncoder(keras.Model):
    """
    Wraps InceptionV3 (pretrained on ImageNet) and extracts features
    from the mixed_10 layer, giving a (batch, 2048) feature vector.

    The backbone is fully frozen; only the dense projection is trained.
    """

    def __init__(self, embed_dim: int = config.EMBED_DIM):
        super().__init__(name="cnn_encoder")
        base = keras.applications.InceptionV3(
            include_top=False,
            weights="imagenet",
            pooling="avg",          # Global average → (batch, 2048)
        )
        base.trainable = False      # Freeze ImageNet weights

        self.backbone = base
        self.fc = layers.Dense(embed_dim, activation="relu", name="feature_proj")
        self.bn = layers.BatchNormalization(name="feature_bn")

    def call(self, images, training=False):
        """
        Args:
            images: float32 tensor (batch, 224, 224, 3), normalized to [0, 1]
        Returns:
            features: float32 tensor (batch, embed_dim)
        """
        # InceptionV3 expects pixels in [-1, 1]
        x = keras.applications.inception_v3.preprocess_input(images * 255.0)
        x = self.backbone(x, training=False)   # (batch, 2048)
        x = self.fc(x, training=training)      # (batch, embed_dim)
        x = self.bn(x, training=training)
        return x


# ── Bahdanau (soft) Attention ─────────────────────────────────────────────────

class BahdanauAttention(keras.layers.Layer):
    """
    Soft attention that produces a context vector by attending over the
    encoder output at each decoder time-step.

    Reference: Bahdanau et al. "Neural Machine Translation by Jointly
               Learning to Align and Translate" (2015)
    """

    def __init__(self, units: int = config.ATTENTION_DIM):
        super().__init__(name="bahdanau_attention")
        self.W1 = layers.Dense(units, name="attn_W1")
        self.W2 = layers.Dense(units, name="attn_W2")
        self.V  = layers.Dense(1,     name="attn_V")

    def call(self, features, hidden):
        """
        Args:
            features: (batch, embed_dim)   — encoder output
            hidden:   (batch, lstm_units)  — previous LSTM hidden state
        Returns:
            context:  (batch, embed_dim)
            weights:  (batch, 1, 1)        — attention distribution
        """
        # Expand dims for broadcasting
        features_exp = tf.expand_dims(features, 1)   # (batch, 1, embed_dim)
        hidden_exp   = tf.expand_dims(hidden,   1)   # (batch, 1, lstm_units)

        score = self.V(tf.nn.tanh(self.W1(features_exp) + self.W2(hidden_exp)))
        # score: (batch, 1, 1)

        weights = tf.nn.softmax(score, axis=1)
        context = weights * features_exp             # (batch, 1, embed_dim)
        context = tf.reduce_sum(context, axis=1)     # (batch, embed_dim)
        return context, weights


# ── LSTM Decoder ──────────────────────────────────────────────────────────────

class LSTMDecoder(keras.Model):
    """
    Single-layer LSTM decoder with:
      - Word embedding (vocab_size → embed_dim)
      - Bahdanau attention over encoder features
      - Output projection to vocabulary logits
    """

    def __init__(
        self,
        vocab_size: int  = config.VOCAB_SIZE,
        embed_dim:  int  = config.EMBED_DIM,
        lstm_units: int  = config.LSTM_UNITS,
        dropout:    float = config.DROPOUT_RATE,
    ):
        super().__init__(name="lstm_decoder")
        self.lstm_units = lstm_units

        self.embedding = layers.Embedding(
            vocab_size, embed_dim, mask_zero=True, name="word_embedding"
        )
        self.attention = BahdanauAttention(units=lstm_units)
        self.lstm_cell = layers.LSTMCell(lstm_units, name="lstm_cell")
        self.dropout   = layers.Dropout(dropout)
        self.fc_out    = layers.Dense(vocab_size, name="output_proj")

    def call(self, token_ids, features, states, training=False):
        """
        Single decoder step.

        Args:
            token_ids: int32 tensor (batch,)       — current input token
            features:  float32 tensor (batch, embed_dim) — encoder features
            states:    [h, c] each (batch, lstm_units)
        Returns:
            logits:  (batch, vocab_size)
            states:  updated [h, c]
            weights: attention weights (batch, 1, 1)
        """
        h, c = states
        context, weights = self.attention(features, h)     # (batch, embed_dim)

        embed = self.embedding(token_ids)                  # (batch, embed_dim)
        x = tf.concat([embed, context], axis=-1)           # (batch, embed_dim*2)
        x = self.dropout(x, training=training)

        output, [h_new, c_new] = self.lstm_cell(x, [h, c])
        logits = self.fc_out(output)                       # (batch, vocab_size)
        return logits, [h_new, c_new], weights

    def initial_states(self, batch_size: int):
        h = tf.zeros((batch_size, self.lstm_units))
        c = tf.zeros((batch_size, self.lstm_units))
        return [h, c]


# ── Full Model ────────────────────────────────────────────────────────────────

class ImageCaptioner(keras.Model):
    """
    End-to-end image captioning model (encoder + decoder).

    Used during training with teacher forcing.
    For inference, use src.predict.CaptionPredictor instead.
    """

    def __init__(
        self,
        vocab_size: int  = config.VOCAB_SIZE,
        embed_dim:  int  = config.EMBED_DIM,
        lstm_units: int  = config.LSTM_UNITS,
        dropout:    float = config.DROPOUT_RATE,
    ):
        super().__init__(name="image_captioner")
        self.encoder = CNNEncoder(embed_dim=embed_dim)
        self.decoder = LSTMDecoder(
            vocab_size=vocab_size,
            embed_dim=embed_dim,
            lstm_units=lstm_units,
            dropout=dropout,
        )

    def call(self, inputs, training=False):
        """
        Args:
            inputs: tuple of (images, captions)
                images:   (batch, 224, 224, 3)
                captions: (batch, seq_len)  — token IDs, includes <start>
        Returns:
            all_logits: (batch, seq_len-1, vocab_size)
        """
        images, captions = inputs
        features = self.encoder(images, training=training)   # (batch, embed_dim)
        batch_size = tf.shape(images)[0]
        states     = self.decoder.initial_states(batch_size)

        all_logits = []
        # Teacher forcing: feed ground-truth tokens step by step
        for t in range(captions.shape[1] - 1):
            token = captions[:, t]
            logits, states, _ = self.decoder(token, features, states, training=training)
            all_logits.append(logits)

        return tf.stack(all_logits, axis=1)   # (batch, seq_len-1, vocab_size)

    def get_config(self):
        return {
            "vocab_size": self.decoder.embedding.input_dim,
            "embed_dim":  self.encoder.fc.units,
            "lstm_units": self.decoder.lstm_units,
            "dropout":    self.decoder.dropout.rate,
        }
