"""
Flask web application for the Image Captioning System.

Run:
    python app.py

Endpoints:
    GET  /              — Web UI
    POST /api/caption   — Upload image, returns JSON captions
    GET  /api/health    — Health check
"""

import os
import io
import time
import base64
import logging
from pathlib import Path

from flask import Flask, request, jsonify, render_template, abort
from flask_cors import CORS
from PIL import Image
import numpy as np

import config
from src.predict import CaptionPredictor

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = config.SECRET_KEY
CORS(app)

os.makedirs(config.UPLOAD_DIR, exist_ok=True)

# Lazy-load the model so the server starts fast
_predictor: CaptionPredictor | None = None


def get_predictor() -> CaptionPredictor:
    global _predictor
    if _predictor is None:
        logger.info("Loading model weights…")
        _predictor = CaptionPredictor(
            model_path=os.path.join(config.CHECKPOINT_DIR, "best_model.h5"),
            tokenizer_path=config.TOKENIZER_PATH,
        )
        logger.info("Model ready.")
    return _predictor


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS
    )


def decode_image(source) -> Image.Image:
    """Accept a FileStorage object or a base64 data-URI string."""
    if hasattr(source, "read"):
        return Image.open(source).convert("RGB")
    if isinstance(source, str) and source.startswith("data:"):
        header, data = source.split(",", 1)
        return Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
    raise ValueError("Unsupported image source format")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": _predictor is not None})


@app.post("/api/caption")
def caption():
    """
    Accepts:
        multipart/form-data  with field `image` (file upload)
        application/json     with field `image` (base64 data-URI)

    Returns JSON:
        {
          "captions": [
            {"rank": 1, "text": "...", "confidence": 0.91},
            ...
          ],
          "inference_ms": 342,
          "tokens": 12
        }
    """
    t0 = time.perf_counter()

    # ── Parse input ──────────────────────────────────────────────────────────
    if request.content_type and "multipart" in request.content_type:
        if "image" not in request.files:
            abort(400, "No image file in request")
        f = request.files["image"]
        if not allowed_file(f.filename):
            abort(415, f"File type not allowed. Use: {config.ALLOWED_EXTENSIONS}")
        img_bytes = f.read()
        if len(img_bytes) > config.MAX_UPLOAD_MB * 1024 * 1024:
            abort(413, f"File exceeds {config.MAX_UPLOAD_MB}MB limit")
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    else:
        data = request.get_json(silent=True) or {}
        if "image" not in data:
            abort(400, "Missing `image` field in JSON body")
        try:
            pil_img = decode_image(data["image"])
        except Exception as exc:
            abort(400, f"Could not decode image: {exc}")

    # ── Inference ─────────────────────────────────────────────────────────────
    try:
        predictor = get_predictor()
        results = predictor.predict(
            pil_img,
            beam_width=config.BEAM_WIDTH,
            top_k=config.TOP_K_CAPTIONS,
        )
    except FileNotFoundError:
        abort(503, "Model weights not found. Run `python scripts/download_model.py` first.")
    except Exception as exc:
        logger.exception("Inference error")
        abort(500, f"Inference failed: {exc}")

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    best_tokens = len(results[0]["text"].split())

    return jsonify(
        {
            "captions": results,
            "inference_ms": elapsed_ms,
            "tokens": best_tokens,
        }
    )


# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(400)
@app.errorhandler(413)
@app.errorhandler(415)
@app.errorhandler(500)
@app.errorhandler(503)
def handle_error(exc):
    return jsonify({"error": str(exc)}), exc.code


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    logger.info(f"Starting server on {config.FLASK_HOST}:{config.FLASK_PORT}")
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG,
    )
