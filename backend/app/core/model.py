# app/core/model.py
"""
Everything related to the ResNet50 checkpoint: building the architecture,
loading trained weights, preprocessing, and running inference.
"""
import io
import json
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


def load_class_names(class_index_path: Path) -> list[str]:
    with open(class_index_path) as f:
        class_to_idx: dict[str, int] = json.load(f)
    ordered = sorted(class_to_idx.items(), key=lambda item: item[1])
    return [name for name, _ in ordered]


def load_checkpoint(
    path: Path,
) -> tuple[nn.Module, list[str], int, list[float], list[float]]:
    if not path.exists():
        raise FileNotFoundError(
            f"Model checkpoint not found. Place the checkpoint at: {path}\n"
            "Or set the MODEL_PATH environment variable to the correct file."
        )

    # This checkpoint IS the raw state_dict (an OrderedDict of tensors),
    # not a wrapped dict with a "model_state_dict" key -- and it has no
    # embedded class names, so those come from class_indices.json instead,
    # which lives next to the checkpoint on disk.
    state_dict = torch.load(path, map_location=DEVICE)

    class_index_path = path.parent / "class_indices.json"
    class_names = load_class_names(class_index_path)
    num_classes = state_dict["fc.5.weight"].shape[0]

    if num_classes != len(class_names):
        raise ValueError(
            f"Checkpoint has {num_classes} output classes but "
            f"class_indices.json has {len(class_names)} entries -- these must match."
        )

    img_size = DEFAULT_IMG_SIZE
    imagenet_mean = DEFAULT_IMAGENET_MEAN
    imagenet_std = DEFAULT_IMAGENET_STD

    model = build_model(num_classes)
    model.load_state_dict(state_dict)
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
    top3 = [{"class": class_names[i], "confidence": float(probs[i])} for i in top_indices]
    pred_idx = int(top_indices[0])
    return {
        "predicted_class": class_names[pred_idx],
        "confidence": float(probs[pred_idx]),
        "top3": top3,
    }
