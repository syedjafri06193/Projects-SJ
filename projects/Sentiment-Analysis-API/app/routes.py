"""
routes.py
RESTful API endpoints for sentiment analysis.

GET  /              → serve the demo UI
POST /api/analyze   → analyze text (VADER by default)
POST /api/analyze/hf → analyze text with HuggingFace model
GET  /api/health    → health check
"""

from flask import Blueprint, request, jsonify, render_template, current_app
from .sentiment import analyze_vader, analyze_huggingface

main = Blueprint("main", __name__)


# ── Utility ────────────────────────────────────────────────────────────────────

def _get_text() -> str | None:
    """Extract 'text' from JSON or form body."""
    data = request.get_json(silent=True) or {}
    return data.get("text") or request.form.get("text")


def _error(msg: str, status: int = 400):
    return jsonify({"error": msg}), status


# ── Routes ─────────────────────────────────────────────────────────────────────

@main.route("/")
def index():
    return render_template("index.html")


@main.route("/api/health")
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})


@main.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Analyze text using NLTK VADER.

    Request body (JSON):
        { "text": "I love this product!" }

    Response:
        {
            "label": "POSITIVE",
            "score": 0.8316,
            "compound": 0.8316,
            "positive": 0.625,
            "neutral": 0.375,
            "negative": 0.0,
            "backend": "nltk-vader",
            "input_length": 21
        }
    """
    text = _get_text()
    if not text or not text.strip():
        return _error("'text' field is required and must not be empty.")
    if len(text) > 5000:
        return _error("Text must be 5,000 characters or fewer.")

    result = analyze_vader(text.strip())
    result["input_length"] = len(text.strip())
    return jsonify(result), 200


@main.route("/api/analyze/hf", methods=["POST"])
def analyze_hf():
    """
    Analyze text using HuggingFace DistilBERT (SST-2).
    Slower on first call while the model downloads (~67 MB).
    """
    text = _get_text()
    if not text or not text.strip():
        return _error("'text' field is required and must not be empty.")
    if len(text) > 5000:
        return _error("Text must be 5,000 characters or fewer.")

    try:
        result = analyze_huggingface(text.strip())
    except Exception as exc:
        current_app.logger.error("HuggingFace error: %s", exc)
        return _error("HuggingFace model unavailable. Try /api/analyze instead.", 503)

    result["input_length"] = len(text.strip())
    return jsonify(result), 200


@main.route("/api/analyze/batch", methods=["POST"])
def analyze_batch():
    """
    Analyze multiple texts at once (VADER).

    Request body:
        { "texts": ["Great!", "Terrible.", "It's okay."] }

    Response:
        { "results": [ {...}, {...}, {...} ] }
    """
    data = request.get_json(silent=True) or {}
    texts = data.get("texts")

    if not isinstance(texts, list) or not texts:
        return _error("'texts' must be a non-empty list.")
    if len(texts) > 100:
        return _error("Batch limited to 100 texts per request.")

    results = []
    for t in texts:
        if not isinstance(t, str) or not t.strip():
            results.append({"error": "invalid or empty string"})
        else:
            r = analyze_vader(t.strip())
            r["input_length"] = len(t.strip())
            results.append(r)

    return jsonify({"results": results, "count": len(results)}), 200
