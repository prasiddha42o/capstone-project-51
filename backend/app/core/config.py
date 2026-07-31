# app/core/config.py
"""
Central place for environment-driven settings and constants.
"""
import os
from pathlib import Path

# backend/app/core/config.py -> repo root is three levels up
REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_MODEL_PATH = REPO_ROOT / "model_and_data_pipeline" / "model_resnet50" / "primary_best.pth"
DEFAULT_CONDITION_MODEL_PATH = REPO_ROOT / "model_and_data_pipeline" / "model_condition" / "primary_best.pth"

MODEL_PATH = Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH)))
# Optional: the condition (clean/contaminated) checkpoint isn't trained yet
# in every environment, so its absence at startup is handled gracefully.
CONDITION_MODEL_PATH = Path(os.getenv("CONDITION_MODEL_PATH", str(DEFAULT_CONDITION_MODEL_PATH)))

DEFAULT_IMG_SIZE = 224
DEFAULT_IMAGENET_MEAN = [0.485, 0.456, 0.406]
DEFAULT_IMAGENET_STD = [0.229, 0.224, 0.225]

VALID_IMAGE_CONTENT = {"image/jpeg", "image/png", "image/bmp", "image/webp"}

CORS_ORIGINS = [os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
