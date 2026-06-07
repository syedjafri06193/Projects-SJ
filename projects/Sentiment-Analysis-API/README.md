# Sentiment Analysis API

A RESTful API for text sentiment analysis, built as part of a portfolio project (Aug–Dec 2022).

**Stack:** Python · Flask · NLTK · Hugging Face Transformers · Deployed on Cloud

---

## Features

- **Dual-backend analysis:** NLTK VADER (fast, lexicon-based) and HuggingFace DistilBERT (pre-trained transformer)
- **Three endpoints:** single-text VADER, single-text HuggingFace, and batch (up to 100 texts)
- **Interactive demo UI** served at `/`
- **Cloud-ready:** `Procfile` for Heroku/Railway/Render, Gunicorn WSGI

---

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
cd sentiment-api
pip install -r requirements.txt

# 2. Run (development)
python run.py

# 3. Open
open http://localhost:5000
```

---

## API Endpoints

### `POST /api/analyze` — VADER sentiment
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'
```
**Response:**
```json
{
  "label": "POSITIVE",
  "score": 0.6369,
  "compound": 0.6369,
  "positive": 0.5,
  "neutral": 0.5,
  "negative": 0.0,
  "backend": "nltk-vader",
  "input_length": 21
}
```

### `POST /api/analyze/hf` — HuggingFace DistilBERT
Same request/response shape. Uses `distilbert-base-uncased-finetuned-sst-2-english`.  
*Downloads ~67 MB on first call.*

### `POST /api/analyze/batch` — Batch (VADER)
```bash
curl -X POST http://localhost:5000/api/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Great!", "Awful.", "It is what it is."]}'
```

### `GET /api/health` — Health check
```json
{"status": "ok", "version": "1.0.0"}
```

---

## Deployment

### Heroku / Railway / Render
```bash
git push heroku main   # or connect repo in dashboard
```
The `Procfile` runs Gunicorn with 2 workers automatically.

### Docker (optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:8000"]
```

---

## Project Structure

```
sentiment-api/
├── run.py                  # Entry point
├── requirements.txt
├── Procfile                # Cloud deployment
├── app/
│   ├── __init__.py         # Flask app factory
│   ├── routes.py           # REST endpoints
│   └── sentiment.py        # VADER + HuggingFace logic
├── templates/
│   └── index.html          # Demo UI
└── static/
    ├── css/style.css
    └── js/demo.js
```
