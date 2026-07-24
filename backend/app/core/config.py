# app/core/config.py
"""
Central place for environment-driven settings and constants.
Keeping these here (instead of scattered across app.py) means changing
a default — e.g. the model path or allowed CORS origin — only needs
one edit.
"""
import os
from pathlib import Path

MODEL_PATH = Path(os.getenv("MODEL_PATH", "models_v2/primary_checkpoint.pth"))

DEFAULT_IMG_SIZE = 224
DEFAULT_IMAGENET_MEAN = [0.485, 0.456, 0.406]
DEFAULT_IMAGENET_STD = [0.229, 0.224, 0.225]

VALID_IMAGE_CONTENT = {"image/jpeg", "image/png", "image/bmp", "image/webp"}

# Frontend dev server origin — update/extend when deploying
CORS_ORIGINS = [os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
