from pathlib import Path

import model_and_data_pipeline.waste_data_pipeline as pipeline
from model_and_data_pipeline.waste_data_pipeline import (
    discover_images,
    deduplicate,
    resolve_class,
    stratified_split,
)

def test_resolve_class_maps_known_folder_names():
    # Arrange
    folder_name = "Plastic Bottle"

    # Act
    mapped_class = resolve_class(folder_name)

    # Assert
    assert mapped_class == "plastic"


def test_discover_images_happy_path_collects_supported_images(tmp_path):
    # Arrange
    datasets_root = tmp_path / "datasets"
    image_path = datasets_root / "trashnet" / "plastic" / "sample.jpg"
    image_path.parent.mkdir(parents=True, exist_ok=True)
    image_path.write_bytes(b"fake-image")

    # Act
    records = discover_images(datasets_root)

    # Assert
    assert records == [(image_path, "plastic")]


def test_deduplicate_removes_duplicate_images(monkeypatch):
    # Arrange
    records = [
        (Path("img_a.jpg"), "plastic"),
        (Path("img_b.jpg"), "plastic"),
    ]

    def fake_phash(path, hash_size=8):
        return "0000000000000000"

    monkeypatch.setattr(pipeline, "phash", fake_phash)

    # Act
    deduped = deduplicate(records)

    # Assert
    assert len(deduped) == 1
    assert deduped[0] == (Path("img_a.jpg"), "plastic")


def test_stratified_split_returns_expected_splits_for_balanced_data():
    # Arrange
    records = [
        (Path("img_1.jpg"), "plastic"),
        (Path("img_2.jpg"), "plastic"),
        (Path("img_3.jpg"), "plastic"),
        (Path("img_4.jpg"), "paper"),
        (Path("img_5.jpg"), "paper"),
        (Path("img_6.jpg"), "paper"),
    ]

    # Act
    split_result = stratified_split(records, val_size=0.33, test_size=0.33)

    # Assert
    assert set(split_result.keys()) == {"train", "val", "test"}
    assert len(split_result["train"]) == 2
    assert len(split_result["val"]) == 2
    assert len(split_result["test"]) == 2


def test_discover_images_with_empty_dataset_returns_empty_list(tmp_path):
    # Arrange
    datasets_root = tmp_path / "empty_dataset"
    datasets_root.mkdir(parents=True, exist_ok=True)

    # Act
    records = discover_images(datasets_root)

    # Assert
    assert records == []
