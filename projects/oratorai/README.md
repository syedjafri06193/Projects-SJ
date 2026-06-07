# 🎤 OratorAI

> AI-powered speech training platform — master public speaking, communication clarity, and accent transformation.

![OratorAI](https://img.shields.io/badge/status-in%20development-00e5a0?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## 🚀 Overview

OratorAI is a communication intelligence system that analyzes how you speak, gives structured AI coaching feedback, and trains you toward accent mastery — turning speech improvement into a measurable, gamified skill system.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙 Real-Time Speech Analysis | Filler words, pace (WPM), clarity, hesitation — scored live |
| 🤖 AI Communication Coach | GPT-powered structured feedback after every session |
| 🌍 Accent Mastery Engine | Phoneme-level scoring vs. 5 target accent models |
| 🎧 Shadowing Practice | Listen → Repeat → Score accuracy against target accent |
| 📊 Progress Dashboard | Long-term trends, heatmaps, streak tracking |
| 🗣 Practice Modes | Impromptu, Interview, Presentation, Debate |

---

## 🏗 Architecture

```
src/
├── components/
│   ├── Waveform.jsx          # Animated waveform visualizer
│   ├── ScoreRing.jsx         # Circular score display
│   ├── PhonemeGrid.jsx       # Phoneme analysis grid
│   ├── FeedbackBlock.jsx     # AI coach feedback panel
│   ├── FillerChips.jsx       # Detected filler word tags
│   ├── SessionRow.jsx        # Session history row
│   └── Heatmap.jsx           # Practice frequency heatmap
├── pages/
│   ├── Landing.jsx           # Home / hero page
│   ├── Coach.jsx             # Speech coach interface
│   ├── AccentMastery.jsx     # Accent training + shadowing
│   └── Dashboard.jsx         # Progress analytics dashboard
├── hooks/
│   ├── useRecorder.js        # Microphone recording hook
│   ├── useWaveform.js        # Canvas waveform animation
│   └── useTimer.js           # Session timer hook
├── utils/
│   ├── audioAnalyzer.js      # Audio processing utilities
│   ├── fillerDetector.js     # Filler word detection logic
│   └── accentScorer.js       # Accent comparison scoring
└── styles/
    ├── globals.css            # CSS variables & reset
    ├── components.css         # Shared component styles
    └── animations.css         # Keyframe animations
```

---

## 📊 Scoring System

| Metric | Weight |
|--------|--------|
| Clarity | 25% |
| Structure | 20% |
| Confidence | 20% |
| Filler Word Usage | 15% |
| Pace Control | 10% |
| Accent Accuracy | 10% |

---

## 🛣 Roadmap

- [x] Phase 1 — UI prototype (all views)
- [ ] Phase 2 — WebRTC microphone capture
- [ ] Phase 3 — Whisper / Deepgram STT integration
- [ ] Phase 4 — Anthropic API coaching layer
- [ ] Phase 5 — Phoneme-level accent scoring (forced alignment)
- [ ] Phase 6 — Voice transformation & playback comparison

---

## 🧠 AI Stack (Planned)

- **Speech-to-Text**: Whisper API / Deepgram
- **NLP Coaching**: Anthropic Claude API
- **Accent Engine**: Phoneme extraction + forced alignment
- **TTS Playback**: ElevenLabs / OpenAI TTS

---

## 🚦 Getting Started

```bash
git clone https://github.com/syedjafri06193/orator-ai.git
cd orator-ai
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📌 License

MIT © 2026 OratorAI
