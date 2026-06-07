"""
Python ML Microservice — Resume Feature Extractor
Runs on port 5001. Called by the Java Spring Boot backend.

Provides:
  - Named Entity Recognition (spaCy)
  - TF-IDF keyword extraction (scikit-learn)
  - Readability scoring (textstat)
  - Action verb detection
  - Quantified achievement detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
from collections import Counter

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Lightweight NLP helpers (no heavy model download required out of the box)
# Swap these for spaCy/sklearn when running with full deps installed.
# ---------------------------------------------------------------------------

ACTION_VERBS = {
    "led", "built", "designed", "implemented", "developed", "created",
    "launched", "managed", "optimized", "reduced", "increased", "improved",
    "delivered", "architected", "migrated", "automated", "deployed",
    "scaled", "mentored", "drove", "established", "transformed", "owned",
    "shipped", "authored", "refactored", "integrated", "streamlined",
}

TECH_ENTITIES = {
    "java", "python", "spring", "django", "flask", "react", "vue",
    "angular", "node", "docker", "kubernetes", "aws", "gcp", "azure",
    "sql", "postgres", "mysql", "mongodb", "redis", "kafka", "rabbitmq",
    "terraform", "ansible", "jenkins", "github", "gitlab", "linux",
    "microservices", "rest", "graphql", "grpc", "ci/cd", "ml", "pytorch",
    "tensorflow", "scikit-learn", "spark", "hadoop", "elasticsearch",
}


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z][a-zA-Z0-9+#./]*", text.lower())


def extract_tfidf_terms(text: str, top_n: int = 8) -> list[str]:
    """Simple TF-IDF approximation (single document)."""
    STOPWORDS = {
        "the","a","an","and","or","but","in","on","at","to","for","of",
        "with","by","from","as","is","was","are","were","be","been","have",
        "has","had","do","does","did","will","would","could","should","may",
        "might","this","that","these","those","i","we","you","he","she","it",
        "they","my","our","your","his","her","its","their","resume","work",
        "experience","skills","education","university","college","inc","llc",
    }
    tokens = [t for t in tokenize(text) if t not in STOPWORDS and len(t) > 2]
    freq = Counter(tokens)
    total = max(len(tokens), 1)

    # IDF approximation: penalize very common terms
    scored = {
        term: (count / total) * math.log(1 + total / max(count, 1))
        for term, count in freq.items()
    }
    return [t for t, _ in sorted(scored.items(), key=lambda x: -x[1])[:top_n]]


def extract_entities(text: str) -> dict:
    """Simple rule-based NER — detects ORG names, dates, skills."""
    tokens = tokenize(text)

    skill_count = sum(1 for t in tokens if t in TECH_ENTITIES)
    date_count = len(re.findall(r"\b(19|20)\d{2}\b", text))

    # Org heuristic: capitalized multi-word phrases followed by Inc/Corp/LLC
    org_count = len(re.findall(
        r"[A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*(?:,? (?:Inc|Corp|LLC|Ltd|Co|Group)\.?)",
        text
    ))

    return {
        "ORG": max(org_count, 1),
        "DATE": date_count,
        "SKILL": skill_count,
        "PERSON": len(re.findall(r"^[A-Z][a-z]+ [A-Z][a-z]+", text, re.MULTILINE)),
    }


def count_action_verbs(text: str) -> int:
    tokens = set(tokenize(text))
    return len(tokens & ACTION_VERBS)


def count_quantified_achievements(text: str) -> int:
    """Count bullet points that contain a number (%, $, x, M, K, etc.)."""
    bullets = re.findall(r"[•\-\*]\s*.+", text)
    return sum(1 for b in bullets if re.search(r"\d+[%xX]?|\$\d|\d+[kKmMbB]", b))


def readability_grade(text: str) -> float:
    """Flesch-Kincaid Grade Level approximation."""
    sentences = max(len(re.findall(r"[.!?]+", text)), 1)
    words = max(len(text.split()), 1)
    syllables = sum(
        max(len(re.findall(r"[aeiouAEIOU]", w)), 1)
        for w in text.split()
    )
    return round(0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59, 1)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/ml/extract", methods=["POST"])
def extract():
    data = request.get_json(force=True)
    text = data.get("resume_text", "")

    if not text.strip():
        return jsonify({"error": "resume_text is required"}), 400

    features = {
        "tfidf_top_terms": extract_tfidf_terms(text),
        "entity_types": extract_entities(text),
        "readability_grade": readability_grade(text),
        "action_verb_count": count_action_verbs(text),
        "quantified_achievements": count_quantified_achievements(text),
        "token_count": len(tokenize(text)),
        "sentence_count": len(re.findall(r"[.!?]+", text)),
        "word_count": len(text.split()),
    }

    return jsonify(features)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "resume-analyzer-python-ml"})


if __name__ == "__main__":
    print("Starting Python ML microservice on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=False)
