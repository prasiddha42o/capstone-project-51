# app/core/model.py
"""
Everything related to the ResNet50 checkpoint: building the architecture,
loading trained weights, preprocessing, and running inference.
Isolated from routing/DB code so the ML side can be tested or swapped
independently.
"""
import io
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from fastapi import HTTPException
from PIL import Image
from torchvision import transforms
from torchvision.models import resnet50

from app.core.config import (
    DEFAULT_IMAGENET_MEAN,
    DEFAULT_IMAGENET_STD,
    DEFAULT_IMG_SIZE,
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def build_model(num_classes: int) -> nn.Module:
    model = resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, 256),
        nn.BatchNorm1d(256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )
    return model


def get_transform(
    img_size: int, imagenet_mean: list[float], imagenet_std: list[float]
) -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=imagenet_mean, std=imagenet_std),
    ])


def load_checkpoint(
    path: Path,
) -> tuple[nn.Module, list[str], int, list[float], list[float]]:
    if not path.exists():
        raise FileNotFoundError(
            f"Model checkpoint not found. Place the checkpoint at: {path}\n"
            "Or set the MODEL_PATH environment variable to the correct file."
        )

    checkpoint = torch.load(path, map_location=DEVICE)
    class_names = checkpoint.get("class_names")
    idx_to_class = checkpoint.get("idx_to_class")
    num_classes = checkpoint.get("num_classes")
    img_size = checkpoint.get("img_size", DEFAULT_IMG_SIZE)
    imagenet_mean = checkpoint.get("imagenet_mean", DEFAULT_IMAGENET_MEAN)
    imagenet_std = checkpoint.get("imagenet_std", DEFAULT_IMAGENET_STD)

    if class_names is None:
        if isinstance(idx_to_class, dict):
            class_names = [idx_to_class[i] for i in sorted(idx_to_class.keys())]
        else:
            raise ValueError("Checkpoint is missing class_names and idx_to_class.")

    if num_classes is None:
        num_classes = len(class_names)

    model = build_model(num_classes)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    return model, class_names, img_size, imagenet_mean, imagenet_std


def predict_image(
    image_bytes: bytes,
    model: nn.Module,
    class_names: list[str],
    img_size: int,
    imagenet_mean: list[float],
    imagenet_std: list[float],
) -> dict[str, Any]:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    transform = get_transform(img_size, imagenet_mean, imagenet_std)
    tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    top_indices = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:3]
    top3 = [
        {"class": class_names[i], "confidence": float(probs[i])}
        for i in top_indices
    ]
    pred_idx = int(top_indices[0])
    return {
        "predicted_class": class_names[pred_idx],
        "confidence": float(probs[pred_idx]),
        "top3": top3,
    }

