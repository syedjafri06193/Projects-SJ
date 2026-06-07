"""
Download and extract the COCO 2017 dataset (images + annotations).

Usage:
    python scripts/download_coco.py [--data_dir data/coco] [--split train val]
"""

import os
import argparse
import zipfile
import urllib.request
from tqdm import tqdm

COCO_URLS = {
    "train": "http://images.cocodataset.org/zips/train2017.zip",
    "val":   "http://images.cocodataset.org/zips/val2017.zip",
    "annotations": "http://images.cocodataset.org/annotations/annotations_trainval2017.zip",
}


class ProgressBar(tqdm):
    def update_to(self, b=1, bsize=1, tsize=None):
        if tsize is not None:
            self.total = tsize
        self.update(b * bsize - self.n)


def download(url: str, dest: str):
    print(f"  Downloading {os.path.basename(dest)} …")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with ProgressBar(unit="B", unit_scale=True, miniters=1) as t:
        urllib.request.urlretrieve(url, dest, reporthook=t.update_to)
    print(f"  Saved → {dest}")


def extract(zip_path: str, output_dir: str):
    print(f"  Extracting {os.path.basename(zip_path)} …")
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(output_dir)
    os.remove(zip_path)
    print("  Done.")


def main():
    parser = argparse.ArgumentParser(description="Download COCO 2017 dataset")
    parser.add_argument("--data_dir", default="data/coco")
    parser.add_argument("--split",    nargs="+", default=["train", "val", "annotations"],
                        choices=["train", "val", "annotations"])
    args = parser.parse_args()

    os.makedirs(args.data_dir, exist_ok=True)

    for split in args.split:
        url      = COCO_URLS[split]
        zip_path = os.path.join(args.data_dir, os.path.basename(url))
        download(url, zip_path)
        extract(zip_path, args.data_dir)

    print("\n✓ COCO 2017 dataset ready.")
    print(f"  Location: {os.path.abspath(args.data_dir)}")


if __name__ == "__main__":
    main()
