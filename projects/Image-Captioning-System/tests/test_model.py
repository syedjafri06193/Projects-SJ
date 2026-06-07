"""
Unit tests for model architecture (CNNEncoder, BahdanauAttention, LSTMDecoder).
"""

import pytest
import numpy as np
import tensorflow as tf

import config
from src.model import CNNEncoder, BahdanauAttention, LSTMDecoder, ImageCaptioner


@pytest.fixture(scope="module")
def encoder():
    return CNNEncoder(embed_dim=64)


@pytest.fixture(scope="module")
def decoder():
    return LSTMDecoder(vocab_size=100, embed_dim=64, lstm_units=128)


class TestCNNEncoder:
    def test_output_shape(self, encoder):
        imgs = tf.zeros((2, 224, 224, 3))
        feats = encoder(imgs, training=False)
        assert feats.shape == (2, 64), f"Expected (2, 64), got {feats.shape}"

    def test_output_dtype(self, encoder):
        imgs = tf.zeros((1, 224, 224, 3))
        feats = encoder(imgs, training=False)
        assert feats.dtype == tf.float32

    def test_backbone_frozen(self, encoder):
        for layer in encoder.backbone.layers:
            assert not layer.trainable, f"Layer {layer.name} should be frozen"


class TestBahdanauAttention:
    def test_output_shapes(self):
        attn = BahdanauAttention(units=64)
        features = tf.zeros((4, 64))
        hidden   = tf.zeros((4, 128))
        context, weights = attn(features, hidden)
        assert context.shape == (4, 64)
        assert weights.shape == (4, 1, 1)

    def test_weights_sum_to_one(self):
        attn     = BahdanauAttention(units=64)
        features = tf.random.normal((2, 64))
        hidden   = tf.random.normal((2, 128))
        _, weights = attn(features, hidden)
        sums = tf.reduce_sum(weights, axis=1).numpy()
        np.testing.assert_allclose(sums, np.ones_like(sums), atol=1e-5)


class TestLSTMDecoder:
    def test_single_step_output(self, decoder):
        features  = tf.zeros((2, 64))
        token_ids = tf.zeros((2,), dtype=tf.int32)
        states    = decoder.initial_states(2)
        logits, new_states, weights = decoder(token_ids, features, states)
        assert logits.shape  == (2, 100)
        assert len(new_states) == 2
        assert new_states[0].shape == (2, 128)

    def test_initial_states_are_zeros(self, decoder):
        h, c = decoder.initial_states(3)
        assert np.allclose(h.numpy(), 0)
        assert np.allclose(c.numpy(), 0)


class TestImageCaptioner:
    def test_full_forward_pass(self):
        model = ImageCaptioner(vocab_size=50, embed_dim=32, lstm_units=64)
        images   = tf.zeros((2, 224, 224, 3))
        captions = tf.zeros((2, 10), dtype=tf.int32)
        logits   = model((images, captions), training=False)
        assert logits.shape == (2, 9, 50)
