"""
Global configuration for the Image Captioning System.
Edit these values to tune model architecture and training.
"""

import os

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
DATA_DIR        = os.path.join(BASE_DIR, "data")
COCO_DIR        = os.path.join(DATA_DIR, "coco")
PROCESSED_DIR   = os.path.join(DATA_DIR, "processed")
MODEL_DIR       = os.path.join(BASE_DIR, "models")
CHECKPOINT_DIR  = os.path.join(MODEL_DIR, "checkpoints")
TOKENIZER_PATH  = os.path.join(MODEL_DIR, "tokenizer.pkl")
STATIC_DIR      = os.path.join(BASE_DIR, "static")
UPLOAD_DIR      = os.path.join(STATIC_DIR, "uploads")

# ── Image ──────────────────────────────────────────────────────────────────────
IMAGE_SIZE          = (224, 224)          # InceptionV3 input resolution
IMAGE_CHANNELS      = 3
IMAGENET_MEAN       = [0.485, 0.456, 0.406]
IMAGENET_STD        = [0.229, 0.224, 0.225]
CNN_FEATURE_DIM     = 2048               # InceptionV3 mixed_10 output dim
MAX_UPLOAD_MB       = 10

# ── Vocabulary ─────────────────────────────────────────────────────────────────
VOCAB_SIZE          = 8_256
START_TOKEN         = "<start>"
END_TOKEN           = "<end>"
PAD_TOKEN           = "<pad>"
UNK_TOKEN           = "<unk>"
MIN_WORD_FREQ       = 5                  # Prune words below this count

# ── Model ──────────────────────────────────────────────────────────────────────
EMBED_DIM           = 256               # Word embedding dimension
LSTM_UNITS          = 512               # LSTM hidden state size
ATTENTION_DIM       = 512               # Attention projection dimension
DROPOUT_RATE        = 0.5
MAX_CAPTION_LEN     = 25               # Max tokens per caption

# ── Beam Search ────────────────────────────────────────────────────────────────
BEAM_WIDTH          = 3
LENGTH_PENALTY      = 0.7              # Alpha for length normalization
TOP_K_CAPTIONS      = 3               # Number of captions to return

# ── Training ───────────────────────────────────────────────────────────────────
BATCH_SIZE          = 64
EPOCHS              = 20
LEARNING_RATE       = 1e-4
LR_DECAY_FACTOR     = 0.5
LR_PATIENCE         = 3               # Epochs before reducing LR
EARLY_STOP_PATIENCE = 5
GRAD_CLIP_NORM      = 5.0
TEACHER_FORCING     = True

# ── Evaluation ─────────────────────────────────────────────────────────────────
EVAL_SPLIT          = "val"
EVAL_BEAM_WIDTH     = 3

# ── Flask ──────────────────────────────────────────────────────────────────────
FLASK_HOST          = "0.0.0.0"
FLASK_PORT          = 5000
FLASK_DEBUG         = os.getenv("FLASK_DEBUG", "false").lower() == "true"
SECRET_KEY          = os.getenv("SECRET_KEY", "change-me-in-production")
ALLOWED_EXTENSIONS  = {"jpg", "jpeg", "png", "webp", "bmp"}
