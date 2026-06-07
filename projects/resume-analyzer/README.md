# Resume Analyzer — AI + Java Hybrid App

A production-grade resume analysis tool built on a **Java Spring Boot** backend, **Python ML** microservice, and **Claude AI** for semantic analysis.

```
┌─────────────┐     REST      ┌──────────────────┐     HTTP      ┌──────────────┐
│   Browser   │ ────────────► │  Java Spring Boot │ ────────────► │  Python ML   │
│  (Frontend) │              │   :8080           │              │  Flask :5001  │
└─────────────┘              └────────┬─────────┘              └──────────────┘
                                      │ Anthropic API
                                      ▼
                               ┌─────────────┐
                               │  Claude AI  │
                               │  (Sonnet 4) │
                               └─────────────┘
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Plain HTML/JS (no build step) |
| Backend | Java 21, Spring Boot 3.2 |
| ML service | Python 3.12, Flask, spaCy, scikit-learn |
| AI | Anthropic Claude (claude-sonnet-4) |
| Infra | Docker, Docker Compose |
| CI | GitHub Actions |

---

## Prerequisites

- Java 21+ and Maven 3.9+
- Python 3.12+
- Docker Desktop (optional — for containerized run)
- An [Anthropic API key](https://console.anthropic.com/)

---

## Running locally (without Docker)

### 1. Clone and set up secrets

```bash
git clone https://github.com/YOUR_USERNAME/resume-analyzer.git
cd resume-analyzer

cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 2. Start the Python ML microservice

```bash
cd python-ml
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
# ✓ Running on http://0.0.0.0:5001
```

### 3. Start the Java backend (new terminal)

```bash
cd java-backend
export ANTHROPIC_API_KEY=sk-ant-your-key-here   # or set in .env
mvn spring-boot:run
# ✓ Tomcat started on port 8080
```

### 4. Open the frontend

```bash
# Just open the file in your browser:
open frontend/index.html

# Or serve it with Python:
cd frontend && python -m http.server 3000
# Then visit http://localhost:3000
```

---

## Running with Docker Compose

```bash
# Make sure .env contains your ANTHROPIC_API_KEY
docker compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Java API  → http://localhost:8080
#   Python ML → http://localhost:5001
```

---

## API reference

### `POST /api/v1/resume/analyze`

**Request body:**
```json
{
  "resumeText": "John Doe...",
  "targetRole": "Senior Backend Engineer",
  "targetCompany": "Stripe"
}
```

**Response:**
```json
{
  "overall_score": 82,
  "headline": "Strong candidate with clear impact",
  "ats_score": 88,
  "keyword_match_pct": 74,
  "years_experience": 5,
  "matched_skills": ["Java", "Spring Boot", "Docker"],
  "missing_skills": ["Kafka", "Terraform"],
  "bonus_skills": ["Microservices"],
  "section_scores": [...],
  "suggestions": [...],
  "ml_features": {...}
}
```

### `GET /api/v1/resume/health`
```json
{"status": "ok", "service": "resume-analyzer-java"}
```

---

## Project structure

```
resume-analyzer/
├── java-backend/
│   ├── src/main/java/com/resumeanalyzer/
│   │   ├── ResumeAnalyzerApplication.java
│   │   ├── controller/ResumeController.java
│   │   ├── service/ResumeAnalysisService.java
│   │   └── model/{ResumeDTO,AnalysisResult}.java
│   ├── src/main/resources/application.properties
│   ├── pom.xml
│   └── Dockerfile
├── python-ml/
│   ├── app/main.py              ← Flask + NLP logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html               ← Single-file UI
│   └── Dockerfile
├── .github/workflows/ci.yml     ← GitHub Actions CI
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Pushing to GitHub

```bash
# One-time setup (if not already cloned from GitHub)
git init
git add .
git commit -m "feat: initial AI + Java hybrid resume analyzer"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/resume-analyzer.git
git branch -M main
git push -u origin main
```

**Important:** `.env` is in `.gitignore` — your API key will never be committed.
Use GitHub Secrets (`Settings → Secrets → Actions → ANTHROPIC_API_KEY`) for CI/CD.

---

## Extending the ML layer

To enable full spaCy + sklearn support, uncomment the deps in `python-ml/requirements.txt` and update `main.py`:

```python
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer

nlp = spacy.load("en_core_web_sm")  # python -m spacy download en_core_web_sm
```

---

## License

MIT
