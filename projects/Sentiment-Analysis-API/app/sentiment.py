"""
sentiment.py
Two-backend sentiment analysis:
  1. NLTK VADER — fast, lexicon-based, no GPU required
  2. HuggingFace transformers — pre-trained DistilBERT fine-tuned on SST-2
"""

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

nltk.download("vader_lexicon", quiet=True)

_vader = SentimentIntensityAnalyzer()

def analyze_vader(text: str) -> dict:
    """Return VADER compound score and label."""
    scores = _vader.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "POSITIVE"
    elif compound <= -0.05:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    return {
        "label": label,
        "score": round(abs(compound), 4),
        "compound": round(compound, 4),
        "positive": round(scores["pos"], 4),
        "neutral": round(scores["neu"], 4),
        "negative": round(scores["neg"], 4),
        "backend": "nltk-vader",
    }


_hf_pipeline = None

def _load_hf():
    """Lazy-load the HuggingFace pipeline (downloads ~67 MB on first call)."""
    global _hf_pipeline
    if _hf_pipeline is None:
        from transformers import pipeline
        _hf_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            revision="714eb0f",
        )
    return _hf_pipeline


def analyze_huggingface(text: str) -> dict:
    """Return HuggingFace DistilBERT sentiment."""
    pipe = _load_hf()
    result = pipe(text[:512])[0]          # model max 512 tokens
    label = result["label"]               # 'POSITIVE' | 'NEGATIVE'
    score = round(result["score"], 4)

    return {
        "label": label,
        "score": score,
        "compound": score if label == "POSITIVE" else -score,
        "backend": "huggingface-distilbert",
    }
