# app/core/condition_classifier.py
"""
Secondary classifier: judges an item's *condition* (e.g. clean vs.
contaminated) as opposed to app.core.model, which classifies the waste
*type*. Same ResNet50 backbone and preprocessing, separate checkpoint --
trained on model_and_data_pipeline's dataset_v2/condition_train split.
"""
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from PIL import Image

from app.core.config import (
    DEFAULT_IMAGENET_MEAN,
    DEFAULT_IMAGENET_STD,
    DEFAULT_IMG_SIZE,
)
from app.core.model import DEVICE, build_model, get_transform, load_class_names


class ConditionClassifier:
    backbone = "resnet50"

    def __init__(self, checkpoint_path: Path, device: torch.device = DEVICE):
        self.checkpoint_path = checkpoint_path
        self.device = device
        self.transform = get_transform(DEFAULT_IMG_SIZE, DEFAULT_IMAGENET_MEAN, DEFAULT_IMAGENET_STD)
        self.model: nn.Module | None = None
        self.class_names: list[str] = []

    def load_model(self) -> None:
        if not self.checkpoint_path.exists():
            raise FileNotFoundError(
                f"Condition model checkpoint not found. Place it at: {self.checkpoint_path}\n"
                "Or set the CONDITION_MODEL_PATH environment variable to the correct file."
            )

        state_dict = torch.load(self.checkpoint_path, map_location=self.device)

        class_index_path = self.checkpoint_path.parent / "class_indices.json"
        self.class_names = load_class_names(class_index_path)
        num_classes = state_dict["fc.5.weight"].shape[0]

        if num_classes != len(self.class_names):
            raise ValueError(
                f"Condition checkpoint has {num_classes} output classes but "
                f"class_indices.json has {len(self.class_names)} entries -- these must match."
            )

        model = build_model(num_classes)
        model.load_state_dict(state_dict)
        model.to(self.device)
        model.eval()
        self.model = model

    def preprocess(self, img: Image.Image) -> torch.Tensor:
        return self.transform(img.convert("RGB")).unsqueeze(0).to(self.device)

    def predict(self, image: Image.Image) -> dict[str, Any]:
        if self.model is None:
            raise RuntimeError("Condition model isn't loaded -- call load_model() first.")

        tensor = self.preprocess(image)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

        pred_idx = int(probs.argmax())
        return {
            "condition": self.class_names[pred_idx],
            "confidence": float(probs[pred_idx]),
        }
