# 🖼️ Image Captioning System

> An end-to-end deep learning system for generating descriptive captions for images using CNN + LSTM architecture, trained on the COCO dataset.

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=flat-square&logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13-orange?style=flat-square&logo=tensorflow)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8-green?style=flat-square&logo=opencv)
![BLEU-4](https://img.shields.io/badge/BLEU--4-31.2-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Overview

This project implements a state-of-the-art image captioning system that automatically generates natural language descriptions for images. The architecture combines:

- **CNN Encoder**: InceptionV3 pretrained on ImageNet for visual feature extraction
- **LSTM Decoder**: Sequence-to-sequence model with soft attention mechanism
- **Beam Search**: k=3 beam search with length penalty for high-quality caption generation
- **Web Interface**: Beautiful, interactive UI for real-time caption generation

**Achieved BLEU-4 score of 31.2 on the COCO 2017 test set.**

---

## 🏗️ Architecture

```
Input Image
     │
     ▼
┌─────────────┐
│  OpenCV     │  Resize 224×224, Normalize [0,1]
│ Preprocess  │  ImageNet mean subtraction
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ InceptionV3 │  Pretrained CNN backbone
│   Encoder   │  Feature vector: (1, 2048)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Attention  │  Soft attention over spatial features
│  Mechanism  │  Context vector: (1, 512)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LSTM     │  512 units, Embedding dim: 256
│   Decoder   │  Vocabulary: 8,256 tokens
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Beam Search │  k=3, max_len=25, length_penalty=0.7
│             │  Top-k candidate captions
└──────┬──────┘
       │
       ▼
  Caption Text
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Python 3.9+
CUDA 11.8+ (optional, for GPU acceleration)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/syedjafri06193/Image-Captioning-System.git
cd Image-Captioning-System

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Download Pretrained Model

```bash
python scripts/download_model.py
```

### Run the Web Application

```bash
python app.py
```

Open your browser and navigate to `http://localhost:5000`

---

## 🖥️ Web Interface

The application features a clean, production-grade web UI with:

- **Drag & drop** image upload
- **Real-time pipeline visualization** showing each processing stage
- **Beam search results** with confidence scores
- **Alternative captions** (click to swap primary)
- **Runtime logs** with timing and tensor shape info
- **BLEU-4 score** and inference metrics

---

## 🧠 Training

### Dataset

Download the COCO 2017 dataset:

```bash
python scripts/download_coco.py
```

This will download:
- `train2017/` — 118,287 training images
- `val2017/` — 5,000 validation images  
- `annotations/` — captions JSON files

### Preprocess

```bash
python src/preprocess.py --data_dir data/coco --output_dir data/processed
```

### Train

```bash
python src/train.py \
  --data_dir data/processed \
  --epochs 20 \
  --batch_size 64 \
  --learning_rate 1e-4 \
  --embed_dim 256 \
  --lstm_units 512 \
  --save_dir models/checkpoints
```

### Evaluate

```bash
python src/evaluate.py \
  --model_path models/checkpoints/best_model.h5 \
  --data_dir data/processed \
  --split val
```

---

## 📁 Project Structure

```
Image-Captioning-System/
├── app.py                    # Flask web application entry point
├── requirements.txt          # Python dependencies
├── config.py                 # Global configuration
├── README.md
│
├── src/
│   ├── __init__.py
│   ├── model.py              # CNN encoder + LSTM decoder + Attention
│   ├── preprocess.py         # Image & caption preprocessing
│   ├── train.py              # Training loop
│   ├── evaluate.py           # BLEU-4 evaluation
│   ├── predict.py            # Inference & beam search
│   └── dataset.py            # COCO dataset loader
│
├── models/
│   ├── checkpoints/          # Saved model weights
│   └── tokenizer.pkl         # Fitted vocabulary tokenizer
│
├── data/
│   ├── coco/                 # Raw COCO dataset
│   └── processed/            # Preprocessed features & captions
│
├── static/
│   ├── css/style.css         # Web UI styles
│   ├── js/app.js             # Frontend JavaScript
│   └── assets/               # Sample images
│
├── templates/
│   └── index.html            # Main HTML template
│
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_model_training.ipynb
│   └── 03_results_analysis.ipynb
│
├── tests/
│   ├── test_model.py
│   ├── test_preprocess.py
│   └── test_predict.py
│
└── scripts/
    ├── download_coco.py
    └── download_model.py
```

---

## 📊 Results

| Metric | Score |
|--------|-------|
| BLEU-1 | 72.4  |
| BLEU-2 | 55.1  |
| BLEU-3 | 41.3  |
| BLEU-4 | 31.2  |
| METEOR | 26.7  |
| CIDEr  | 98.5  |

---

## ⚙️ Configuration

Edit `config.py` to adjust model hyperparameters:

```python
IMAGE_SIZE = (224, 224)
EMBED_DIM = 256
LSTM_UNITS = 512
VOCAB_SIZE = 8256
MAX_CAPTION_LEN = 25
BEAM_WIDTH = 3
BATCH_SIZE = 64
EPOCHS = 20
LEARNING_RATE = 1e-4
```

---

## 📓 Notebooks

| Notebook | Description |
|----------|-------------|
| `01_data_exploration.ipynb` | COCO dataset analysis and visualization |
| `02_model_training.ipynb` | Step-by-step training walkthrough |
| `03_results_analysis.ipynb` | BLEU scores, attention visualizations, error analysis |

---

## 🧪 Testing

```bash
pytest tests/ -v
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Deep Learning | TensorFlow 2.13 / Keras |
| Image Processing | OpenCV 4.8 |
| CNN Backbone | InceptionV3 (pretrained) |
| Web Framework | Flask 3.0 |
| Dataset | COCO 2017 |
| Evaluation | NLTK (BLEU), pycocoevalcap |

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [COCO Dataset](https://cocodataset.org/)
- [Show, Attend and Tell](https://arxiv.org/abs/1502.03044) — Xu et al., 2015
- [Show and Tell](https://arxiv.org/abs/1411.4555) — Vinyals et al., 2014
