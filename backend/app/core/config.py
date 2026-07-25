# app/core/config.py
"""
Central place for environment-driven settings and constants.
"""
import os
from pathlib import Path

MODEL_PATH = Path(os.getenv(
    "MODEL_PATH",
    "/Users/prassanna/Downloads/Capstone_project/model_and_data_pipeline/model_resnet50/primary_best.pth",
))

DEFAULT_IMG_SIZE = 224
DEFAULT_IMAGENET_MEAN = [0.485, 0.456, 0.406]
DEFAULT_IMAGENET_STD = [0.229, 0.224, 0.225]

VALID_IMAGE_CONTENT = {"image/jpeg", "image/png", "image/bmp", "image/webp"}

CORS_ORIGINS = [os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
