"""
Unit tests for preprocessing utilities.
"""

import numpy as np
import pytest
from unittest.mock import patch, MagicMock
import tensorflow as tf

from src.preprocess import clean_caption, build_tokenizer, encode_captions
import config


class TestCleanCaption:
    def test_adds_tokens(self):
        result = clean_caption("A dog runs fast!")
        assert result.startswith(config.START_TOKEN)
        assert result.endswith(config.END_TOKEN)

    def test_lowercase(self):
        result = clean_caption("A Dog")
        assert "A Dog" not in result
        assert "a dog" in result

    def test_strips_punctuation(self):
        result = clean_caption("Hello, world!")
        assert "," not in result
        assert "!" not in result

    def test_collapses_whitespace(self):
        result = clean_caption("too   many    spaces")
        assert "  " not in result


class TestBuildTokenizer:
    def test_vocabulary_size(self):
        captions = [f"word{i} sentence" for i in range(200)]
        tok = build_tokenizer(captions, vocab_size=50)
        assert len(tok.word_index) >= 1

    def test_start_end_tokens(self):
        captions = [f"{config.START_TOKEN} hello {config.END_TOKEN}"]
        tok = build_tokenizer(captions, vocab_size=100)
        # Start/end tokens should appear in the index
        start_clean = config.START_TOKEN.strip("<>")
        assert any(start_clean in k for k in tok.word_index)


class TestEncodeCaptions:
    def test_output_shape(self):
        tok = build_tokenizer(["hello world"] * 10)
        encoded = encode_captions(["hello world"] * 5, tok, max_len=10)
        assert encoded.shape == (5, 10)

    def test_padded_with_zeros(self):
        tok = build_tokenizer(["hi"] * 10)
        encoded = encode_captions(["hi"], tok, max_len=10)
        # Short caption → trailing zeros
        assert encoded[0, -1] == 0

    def test_truncated_to_max_len(self):
        tok = build_tokenizer([" ".join([f"word{i}" for i in range(50)])])
        encoded = encode_captions([" ".join([f"word{i}" for i in range(50)])], tok, max_len=8)
        assert encoded.shape[1] == 8
