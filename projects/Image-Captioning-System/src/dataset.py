"""
TensorFlow Dataset pipeline for training and validation.

Usage:
    from src.dataset import build_dataset
    train_ds, val_ds = build_dataset(data_dir="data/processed")
"""

import os
import json
import pickle
import numpy as np
import tensorflow as tf
import config


def build_dataset(
    data_dir: str = config.PROCESSED_DIR,
    batch_size: int = config.BATCH_SIZE,
    shuffle: bool = True,
    cache: bool = True,
) -> tuple[tf.data.Dataset, tf.data.Dataset]:
    """
    Build tf.data.Dataset pipelines for train and validation splits.

    Each dataset yields batches of:
        (features, captions_in, captions_out)

    where features    is (batch, 2048)          — precomputed CNN features
          captions_in is (batch, max_len - 1)   — shifted right (input tokens)
          captions_out is (batch, max_len - 1)  — shifted left  (target tokens)

    Args:
        data_dir:   Path to preprocessed .npy files.
        batch_size: Number of examples per batch.
        shuffle:    Shuffle training data each epoch.
        cache:      Cache datasets in memory (fast for small datasets).

    Returns:
        (train_ds, val_ds) — tf.data.Dataset objects.
    """
    train_ds = _load_split(data_dir, "train", batch_size, shuffle=shuffle, cache=cache)
    val_ds   = _load_split(data_dir, "val",   batch_size, shuffle=False,  cache=cache)
    return train_ds, val_ds


def _load_split(
    data_dir: str,
    split: str,
    batch_size: int,
    shuffle: bool,
    cache: bool,
) -> tf.data.Dataset:
    features_path = os.path.join(data_dir, f"{split}_features.npy")
    captions_path = os.path.join(data_dir, f"{split}_captions.npy")

    if not os.path.exists(features_path):
        raise FileNotFoundError(
            f"Preprocessed file not found: {features_path}\n"
            "Run `python src/preprocess.py` first."
        )

    features = np.load(features_path).astype(np.float32)   # (N, 2048)
    captions = np.load(captions_path).astype(np.int32)     # (N, max_len)

    # Shift captions to create (input, target) pairs
    caps_in  = captions[:, :-1]   # all tokens except last
    caps_out = captions[:, 1:]    # all tokens except first (<start>)

    ds = tf.data.Dataset.from_tensor_slices((features, caps_in, caps_out))

    if shuffle:
        ds = ds.shuffle(buffer_size=min(len(features), 10_000), reshuffle_each_iteration=True)

    ds = ds.batch(batch_size, drop_remainder=True)
    ds = ds.map(_pack_batch, num_parallel_calls=tf.data.AUTOTUNE)

    if cache:
        ds = ds.cache()

    ds = ds.prefetch(tf.data.AUTOTUNE)
    return ds


def _pack_batch(features, caps_in, caps_out):
    """Re-pack batch into dict format expected by the training loop."""
    return {"features": features, "caps_in": caps_in}, caps_out


def load_tokenizer(path: str = config.TOKENIZER_PATH):
    """Load the pickled Keras Tokenizer."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Tokenizer not found: {path}\n"
            "Run `python src/preprocess.py` first."
        )
    with open(path, "rb") as f:
        return pickle.load(f)
