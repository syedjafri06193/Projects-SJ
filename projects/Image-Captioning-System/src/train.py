"""
Training script for the Image Captioning System.

Usage:
    python src/train.py [options]

Example:
    python src/train.py \\
        --data_dir data/processed \\
        --epochs 20 \\
        --batch_size 64 \\
        --learning_rate 1e-4 \\
        --save_dir models/checkpoints
"""

import os
import argparse
import logging
import time

import numpy as np
import tensorflow as tf
from tensorflow import keras

import config
from src.model import ImageCaptioner
from src.dataset import build_dataset, load_tokenizer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


# ── Loss ──────────────────────────────────────────────────────────────────────

def masked_sparse_ce(y_true, y_pred):
    """
    Sparse categorical cross-entropy that ignores padding tokens (id=0).
    """
    loss_fn = keras.losses.SparseCategoricalCrossentropy(
        from_logits=True, reduction="none"
    )
    loss = loss_fn(y_true, y_pred)                        # (batch, seq_len)
    mask = tf.cast(tf.not_equal(y_true, 0), loss.dtype)  # 0 = <pad>
    loss = loss * mask
    return tf.reduce_sum(loss) / tf.reduce_sum(mask)


# ── Training step ─────────────────────────────────────────────────────────────

@tf.function
def train_step(model, optimizer, images, captions):
    """Single gradient update step."""
    with tf.GradientTape() as tape:
        logits = model((images, captions[:, :-1]), training=True)
        loss   = masked_sparse_ce(captions[:, 1:], logits)

    grads = tape.gradient(loss, model.trainable_variables)
    grads, _ = tf.clip_by_global_norm(grads, config.GRAD_CLIP_NORM)
    optimizer.apply_gradients(zip(grads, model.trainable_variables))
    return loss


@tf.function
def val_step(model, images, captions):
    """Validation forward pass (no gradient)."""
    logits = model((images, captions[:, :-1]), training=False)
    return masked_sparse_ce(captions[:, 1:], logits)


# ── Main training loop ────────────────────────────────────────────────────────

def train(args):
    os.makedirs(args.save_dir, exist_ok=True)
    os.makedirs(config.MODEL_DIR, exist_ok=True)

    # ── Data ──────────────────────────────────────────────────────────────────
    logger.info("Loading datasets…")
    train_ds, val_ds = build_dataset(
        data_dir=args.data_dir,
        batch_size=args.batch_size,
    )

    # ── Model ──────────────────────────────────────────────────────────────────
    logger.info("Building model…")
    model = ImageCaptioner(
        vocab_size=config.VOCAB_SIZE,
        embed_dim=args.embed_dim,
        lstm_units=args.lstm_units,
    )

    # Optimizer with exponential decay
    lr_schedule = keras.optimizers.schedules.ExponentialDecay(
        initial_learning_rate=args.learning_rate,
        decay_steps=1000,
        decay_rate=0.96,
        staircase=True,
    )
    optimizer = keras.optimizers.Adam(learning_rate=lr_schedule, clipnorm=config.GRAD_CLIP_NORM)

    # ── Callbacks state ────────────────────────────────────────────────────────
    best_val_loss     = float("inf")
    patience_counter  = 0
    history           = {"train_loss": [], "val_loss": []}

    # ── Epoch loop ─────────────────────────────────────────────────────────────
    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        train_losses, val_losses = [], []

        # Training
        for batch in train_ds:
            inputs, targets = batch
            loss = train_step(model, optimizer, inputs["features"], targets)
            train_losses.append(loss.numpy())

        # Validation
        for batch in val_ds:
            inputs, targets = batch
            loss = val_step(model, inputs["features"], targets)
            val_losses.append(loss.numpy())

        train_loss = float(np.mean(train_losses))
        val_loss   = float(np.mean(val_losses))
        elapsed    = time.time() - t0

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)

        logger.info(
            f"Epoch {epoch:02d}/{args.epochs}  "
            f"train_loss={train_loss:.4f}  val_loss={val_loss:.4f}  "
            f"time={elapsed:.1f}s"
        )

        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            save_path = os.path.join(args.save_dir, "best_model.h5")
            model.save_weights(save_path)
            logger.info(f"  ✓ New best model saved → {save_path}")
        else:
            patience_counter += 1
            if patience_counter >= config.EARLY_STOP_PATIENCE:
                logger.info(f"Early stopping after {epoch} epochs.")
                break

    logger.info(f"Training complete. Best val_loss={best_val_loss:.4f}")
    return history


def main():
    parser = argparse.ArgumentParser(description="Train the Image Captioning model")
    parser.add_argument("--data_dir",      default=config.PROCESSED_DIR)
    parser.add_argument("--save_dir",      default=config.CHECKPOINT_DIR)
    parser.add_argument("--epochs",        type=int,   default=config.EPOCHS)
    parser.add_argument("--batch_size",    type=int,   default=config.BATCH_SIZE)
    parser.add_argument("--learning_rate", type=float, default=config.LEARNING_RATE)
    parser.add_argument("--embed_dim",     type=int,   default=config.EMBED_DIM)
    parser.add_argument("--lstm_units",    type=int,   default=config.LSTM_UNITS)
    args = parser.parse_args()

    train(args)


if __name__ == "__main__":
    main()
