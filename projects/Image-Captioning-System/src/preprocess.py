"""
Preprocessing pipeline for the Image Captioning System.

Usage (CLI):
    python src/preprocess.py --data_dir data/coco --output_dir data/processed

What this script does:
    1. Reads COCO annotation JSON files (train + val splits)
    2. Builds and saves the vocabulary tokenizer
    3. Tokenizes and pads all captions
    4. Extracts + caches CNN features for every image
    5. Saves everything as .npy / .pkl files for fast loading during training
"""

import os
import json
import pickle
import argparse
import logging
from pathlib import Path

import numpy as np
import cv2
from tqdm import tqdm
import tensorflow as tf
from tensorflow import keras

import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


# ── Image utilities ───────────────────────────────────────────────────────────

def load_and_preprocess_image(image_path: str) -> np.ndarray:
    """
    Load an image with OpenCV, resize to 224×224, and normalize to [0, 1].

    Args:
        image_path: Absolute or relative path to image file.
    Returns:
        np.ndarray of shape (224, 224, 3), dtype float32.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, config.IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    img = img.astype(np.float32) / 255.0
    return img


# ── Caption utilities ─────────────────────────────────────────────────────────

def clean_caption(text: str) -> str:
    """Lowercase, strip punctuation, add start/end tokens."""
    import re
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return f"{config.START_TOKEN} {text} {config.END_TOKEN}"


def build_tokenizer(captions: list[str], vocab_size: int = config.VOCAB_SIZE):
    """Fit a Keras Tokenizer on all captions."""
    tokenizer = keras.preprocessing.text.Tokenizer(
        num_words=vocab_size,
        oov_token=config.UNK_TOKEN,
        filters='!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n',
    )
    tokenizer.fit_on_texts(captions)
    logger.info(f"Vocabulary size: {min(len(tokenizer.word_index), vocab_size)}")
    return tokenizer


def encode_captions(
    captions: list[str],
    tokenizer,
    max_len: int = config.MAX_CAPTION_LEN,
) -> np.ndarray:
    """Convert caption strings to padded integer sequences."""
    sequences = tokenizer.texts_to_sequences(captions)
    padded = keras.preprocessing.sequence.pad_sequences(
        sequences, maxlen=max_len, padding="post", truncating="post"
    )
    return padded.astype(np.int32)


# ── Feature extraction ────────────────────────────────────────────────────────

def build_feature_extractor():
    """Return InceptionV3 up to mixed_10 with global average pooling."""
    base = keras.applications.InceptionV3(
        include_top=False, weights="imagenet", pooling="avg"
    )
    base.trainable = False
    return base


def extract_features(
    image_paths: list[str],
    output_path: str,
    batch_size: int = 32,
):
    """
    Extract CNN features for every image and save to a .npy file.

    Args:
        image_paths: List of image file paths.
        output_path: Where to save the resulting feature array (.npy).
        batch_size:  Images per batch for GPU efficiency.
    """
    extractor = build_feature_extractor()
    features_list = []

    for start in tqdm(range(0, len(image_paths), batch_size), desc="Extracting features"):
        batch_paths = image_paths[start : start + batch_size]
        batch_imgs  = np.stack([load_and_preprocess_image(p) for p in batch_paths])
        # InceptionV3 expects [-1, 1]
        batch_inp   = keras.applications.inception_v3.preprocess_input(batch_imgs * 255.0)
        feats       = extractor(batch_inp, training=False).numpy()
        features_list.append(feats)

    features = np.concatenate(features_list, axis=0)   # (N, 2048)
    np.save(output_path, features)
    logger.info(f"Saved features → {output_path}  shape={features.shape}")
    return features


# ── Main pipeline ─────────────────────────────────────────────────────────────

def preprocess_split(
    annotation_file: str,
    image_dir: str,
    output_dir: str,
    split: str,
    tokenizer=None,
) -> dict:
    """
    Preprocess one split (train or val).

    Returns a dict with tokenizer (fitted on train) and arrays of
    image paths, raw captions, encoded captions, and CNN features.
    """
    os.makedirs(output_dir, exist_ok=True)

    logger.info(f"Loading annotations: {annotation_file}")
    with open(annotation_file) as f:
        coco = json.load(f)

    # Map image_id → file_name
    id2file = {img["id"]: img["file_name"] for img in coco["images"]}

    image_paths, raw_captions = [], []
    for ann in coco["annotations"]:
        fname = id2file.get(ann["image_id"])
        if fname is None:
            continue
        image_paths.append(os.path.join(image_dir, fname))
        raw_captions.append(clean_caption(ann["caption"]))

    logger.info(f"  {split}: {len(raw_captions):,} (image, caption) pairs")

    # Build / reuse tokenizer
    if tokenizer is None:
        logger.info("Building vocabulary…")
        tokenizer = build_tokenizer(raw_captions)
        tok_path = os.path.join(output_dir, "..", "models", "tokenizer.pkl")
        os.makedirs(os.path.dirname(tok_path), exist_ok=True)
        with open(tok_path, "wb") as f:
            pickle.dump(tokenizer, f)
        logger.info(f"Tokenizer saved → {tok_path}")

    # Encode captions
    encoded = encode_captions(raw_captions, tokenizer)
    np.save(os.path.join(output_dir, f"{split}_captions.npy"), encoded)
    logger.info(f"Captions encoded → {split}_captions.npy  shape={encoded.shape}")

    # Save image path list
    paths_file = os.path.join(output_dir, f"{split}_image_paths.json")
    with open(paths_file, "w") as f:
        json.dump(image_paths, f)

    # Extract CNN features
    feat_path = os.path.join(output_dir, f"{split}_features.npy")
    extract_features(image_paths, feat_path)

    return {"tokenizer": tokenizer, "image_paths": image_paths, "captions": encoded}


def main():
    parser = argparse.ArgumentParser(description="Preprocess COCO data")
    parser.add_argument("--data_dir",   default=config.COCO_DIR,      help="Path to COCO dataset root")
    parser.add_argument("--output_dir", default=config.PROCESSED_DIR, help="Where to save processed files")
    args = parser.parse_args()

    train_ann = os.path.join(args.data_dir, "annotations", "captions_train2017.json")
    val_ann   = os.path.join(args.data_dir, "annotations", "captions_val2017.json")
    train_img = os.path.join(args.data_dir, "train2017")
    val_img   = os.path.join(args.data_dir, "val2017")

    result = preprocess_split(train_ann, train_img, args.output_dir, "train")
    preprocess_split(val_ann, val_img, args.output_dir, "val", tokenizer=result["tokenizer"])

    logger.info("Preprocessing complete.")


if __name__ == "__main__":
    main()
