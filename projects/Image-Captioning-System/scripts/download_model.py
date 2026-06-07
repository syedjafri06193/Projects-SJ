"""
Download pretrained model weights and tokenizer from GitHub Releases.

Usage:
    python scripts/download_model.py
"""

import os
import urllib.request
from pathlib import Path

import config

RELEASE_BASE = (
    "https://github.com/syedjafri06193/Image-Captioning-System/releases/latest/download"
)

ARTIFACTS = {
    "best_model.h5":  os.path.join(config.CHECKPOINT_DIR, "best_model.h5"),
    "tokenizer.pkl":  config.TOKENIZER_PATH,
}


def download(url: str, dest: str):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"Downloading {os.path.basename(dest)} …", end=" ", flush=True)
    urllib.request.urlretrieve(url, dest)
    size_mb = os.path.getsize(dest) / 1024 / 1024
    print(f"done ({size_mb:.1f} MB)")


def main():
    print("Downloading pretrained weights…\n")
    for filename, local_path in ARTIFACTS.items():
        if os.path.exists(local_path):
            print(f"  {filename} already exists, skipping.")
            continue
        url = f"{RELEASE_BASE}/{filename}"
        try:
            download(url, local_path)
        except Exception as e:
            print(f"\n  ✗ Failed to download {filename}: {e}")
            print("    Train your own model with: python src/train.py")

    print("\n✓ Model ready. Start the server with: python app.py")


if __name__ == "__main__":
    main()
