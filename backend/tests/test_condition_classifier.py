# tests/test_condition_classifier.py
"""
Builds a tiny throwaway checkpoint on the fly so these tests don't depend on
a trained condition-model checkpoint being present on disk.
"""
import json
from pathlib import Path

import pytest
import torch
from PIL import Image

from app.core.condition_classifier import ConditionClassifier
from app.core.model import build_model

CLASS_NAMES = ["clean", "contaminated"]


@pytest.fixture
def fake_checkpoint(tmp_path: Path) -> Path:
    model = build_model(len(CLASS_NAMES))
    checkpoint_path = tmp_path / "primary_best.pth"
    torch.save(model.state_dict(), checkpoint_path)
    with open(tmp_path / "class_indices.json", "w") as f:
        json.dump({name: i for i, name in enumerate(CLASS_NAMES)}, f)
    return checkpoint_path


def test_load_model_missing_checkpoint_raises(tmp_path: Path):
    clf = ConditionClassifier(tmp_path / "does_not_exist.pth", device=torch.device("cpu"))
    with pytest.raises(FileNotFoundError):
        clf.load_model()


def test_predict_before_load_raises(fake_checkpoint: Path):
    clf = ConditionClassifier(fake_checkpoint, device=torch.device("cpu"))
    with pytest.raises(RuntimeError):
        clf.predict(Image.new("RGB", (50, 50)))


def test_load_model_and_predict(fake_checkpoint: Path):
    clf = ConditionClassifier(fake_checkpoint, device=torch.device("cpu"))
    clf.load_model()

    assert clf.model is not None
    assert clf.class_names == CLASS_NAMES

    result = clf.predict(Image.new("RGB", (300, 300), color=(120, 180, 90)))
    assert result["condition"] in CLASS_NAMES
    assert 0.0 <= result["confidence"] <= 1.0


def test_preprocess_shape(fake_checkpoint: Path):
    clf = ConditionClassifier(fake_checkpoint, device=torch.device("cpu"))
    clf.load_model()
    tensor = clf.preprocess(Image.new("RGB", (500, 400)))
    assert tensor.shape == (1, 3, 224, 224)
