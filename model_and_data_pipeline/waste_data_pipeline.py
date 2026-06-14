"""
Waste Classification Dataset Pipeline
======================================
Group 51 — AI-Based Waste Classification System

Handles:
  1. Merging 5 datasets into a unified folder structure
  2. Relabeling all source class names → your 8 target classes
  3. Perceptual-hash deduplication across datasets
  4. Stratified train / val / test split (70 / 15 / 15)
  5. Per-class summary report

Target classes:
  plastic | paper | metal | organic | e-waste | hazardous | general_trash | glass

Usage:
  pip install Pillow imagehash scikit-learn tqdm
  python waste_data_pipeline.py --datasets_root ./raw_datasets --output ./dataset

Expected raw_datasets folder structure (download each dataset and unzip here):
  raw_datasets/
    trashnet/          (from kaggle: feyzazkefe/trashnet)
    taco/              (from github: pedropro/TACO  — use the 'data' folder)
    waste_sekar/       (from kaggle: techsash/waste-classification-data)
    garbage_v2/        (from kaggle: sumn2u/garbage-classification-v2)
    ewaste/            (from kaggle: akshat103/e-waste-image-dataset)
    realwaste/         (from kaggle: joebeachcapital/realwaste)
"""

import os
import shutil
import hashlib
import argparse
import json
import random
from pathlib import Path
from collections import defaultdict

from PIL import Image
import imagehash
from sklearn.model_selection import train_test_split
from tqdm import tqdm


# ---------------------------------------------------------------------------
# 1. CLASS MAPPING — source dataset folder names → your 8 target classes
# ---------------------------------------------------------------------------

CLASS_MAP = {
    # ── TrashNet ──────────────────────────────────────────────────────────
    "plastic":          "plastic",
    "paper":            "paper",
    "metal":            "metal",
    "glass":            "glass",
    "cardboard":        "paper",        # cardboard → paper (similar recycling stream)
    "trash":            "general_trash",

    # ── TACO (uses subcategory folder names) ───────────────────────────────
    "plastic_bag":      "plastic",
    "plastic_bottle":   "plastic",
    "plastic_cup":      "plastic",
    "plastic_straw":    "plastic",
    "plastic_utensil":  "plastic",
    "plastic_film":     "plastic",
    "drink_can":        "metal",
    "food_can":         "metal",
    "aerosol":          "hazardous",
    "battery":          "hazardous",
    "light_bulb":       "hazardous",
    "medicine":         "hazardous",
    "chemical":         "hazardous",
    "newspaper":        "paper",
    "magazine":         "paper",
    "cardboard_box":    "paper",
    "paper_bag":        "paper",
    "tissue":           "paper",
    "glass_bottle":     "glass",
    "glass_jar":        "glass",
    "food_waste":       "organic",
    "organic":          "organic",
    "biological":       "organic",
    "rope":             "general_trash",
    "shoe":             "general_trash",
    "clothing":         "general_trash",
    "unlabeled":        "general_trash",

    # ── Waste Sekar ───────────────────────────────────────────────────────
    "o":                "organic",      # 'O' = organic in this dataset
    "r":                "plastic",      # 'R' = recyclable (mostly plastic images)

    # ── garbage-classification-v2 ─────────────────────────────────────────
    "biological":       "organic",
    "brown-glass":      "glass",
    "green-glass":      "glass",
    "white-glass":      "glass",
    "metal":            "metal",
    "paper":            "paper",
    "cardboard":        "paper",
    "plastic":          "plastic",
    "trash":            "general_trash",
    "battery":          "hazardous",
    "clothes":          "general_trash",
    "shoes":            "general_trash",

    # ── E-waste dataset ───────────────────────────────────────────────────
    "chips":            "e-waste",
    "cpu":              "e-waste",
    "laptop":           "e-waste",
    "mobile":           "e-waste",
    "phone":            "e-waste",
    "pcb":              "e-waste",
    "wire":             "e-waste",
    "appliance":        "e-waste",
    "keyboard":         "e-waste",
    "monitor":          "e-waste",
    "printer":          "e-waste",
    "television":       "e-waste",
    "electronic":       "e-waste",
    "ewaste":           "e-waste",
    "e-waste":          "e-waste",

    # ── RealWaste ─────────────────────────────────────────────────────────
    "food organics":    "organic",
    "food_organics":    "organic",
    "misc trash":       "general_trash",
    "misc_trash":       "general_trash",
    "soft plastics":    "plastic",
    "soft_plastics":    "plastic",
    "hard plastics":    "plastic",
    "hard_plastics":    "plastic",
    "paper & cardboard":"paper",
    "paper_cardboard":  "paper",
    "glass bottles":    "glass",
    "glass_bottles":    "glass",
    "cans":             "metal",
    "textiles":         "general_trash",
}

TARGET_CLASSES = [
    "plastic", "paper", "metal", "glass",
    "organic", "e-waste", "hazardous", "general_trash"
]

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# ---------------------------------------------------------------------------
# 2. HELPERS
# ---------------------------------------------------------------------------

def normalize_key(name: str) -> str:
    """Lowercase + strip spaces/underscores for fuzzy matching."""
    return name.lower().replace("-", "_").replace(" ", "_").strip()


def resolve_class(folder_name: str):
    """Map a raw folder name to one of the 8 target classes."""
    key = normalize_key(folder_name)
    # Direct match
    if key in CLASS_MAP:
        return CLASS_MAP[key]
    # Partial match — e.g. 'Plastic_bottle_v2'
    for src, tgt in CLASS_MAP.items():
        if src in key:
            return tgt
    return None


def phash(image_path: Path, hash_size: int = 8) -> str:
    """Return perceptual hash string for an image."""
    try:
        img = Image.open(image_path).convert("RGB")
        return str(imagehash.phash(img, hash_size=hash_size))
    except Exception:
        # Fallback to MD5 if image is corrupt
        return hashlib.md5(image_path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# 3. DISCOVERY — walk each dataset folder, collect (path, target_class) pairs
# ---------------------------------------------------------------------------

def discover_images(datasets_root: Path) -> list[tuple[Path, str]]:
    """
    Walk datasets_root recursively. For each image file, find the
    nearest parent folder whose name resolves to a target class.
    Returns list of (image_path, target_class).
    """
    records = []
    unresolved_folders = set()

    for img_path in datasets_root.rglob("*"):
        if img_path.suffix.lower() not in VALID_EXTENSIONS:
            continue
        if not img_path.is_file():
            continue

        # Walk up ancestors to find a classifiable folder name
        target = None
        for parent in img_path.parents:
            if parent == datasets_root:
                break
            target = resolve_class(parent.name)
            if target:
                break

        if target:
            records.append((img_path, target))
        else:
            unresolved_folders.add(img_path.parent.name)

    if unresolved_folders:
        print(f"\n⚠  Could not resolve these folder names (images skipped):")
        for f in sorted(unresolved_folders):
            print(f"     '{f}'  — add it to CLASS_MAP if needed")

    return records


# ---------------------------------------------------------------------------
# 4. DEDUPLICATION — perceptual hash across all collected images
# ---------------------------------------------------------------------------

def deduplicate(
    records: list[tuple[Path, str]],
    hamming_threshold: int = 8,
) -> list[tuple[Path, str]]:
    """
    Remove near-duplicate images using perceptual hashing.
    Two images are considered duplicates if their hash distance <= threshold.
    Keeps the first occurrence encountered.
    hamming_threshold=8 catches resized / slightly compressed copies.
    """
    print("\n🔍  Computing perceptual hashes for deduplication...")
    seen_hashes: list[imagehash.ImageHash] = []
    unique_records = []
    duplicates = 0

    for img_path, label in tqdm(records, unit="img"):
        h_str = phash(img_path)
        try:
            h = imagehash.hex_to_hash(h_str)
        except Exception:
            # MD5 fallback hash — treat as unique
            unique_records.append((img_path, label))
            continue

        is_dup = any(
            abs(h - existing) <= hamming_threshold
            for existing in seen_hashes
        )
        if is_dup:
            duplicates += 1
        else:
            seen_hashes.append(h)
            unique_records.append((img_path, label))

    print(f"   Removed {duplicates} duplicates. Kept {len(unique_records)} unique images.")
    return unique_records


# ---------------------------------------------------------------------------
# 5. SPLIT — stratified 70 / 15 / 15
# ---------------------------------------------------------------------------

def stratified_split(
    records: list[tuple[Path, str]],
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> dict[str, list[tuple[Path, str]]]:
    """Return {'train': [...], 'val': [...], 'test': [...]}."""
    paths  = [r[0] for r in records]
    labels = [r[1] for r in records]

    # First split off test
    train_val_p, test_p, train_val_l, test_l = train_test_split(
        paths, labels,
        test_size=test_size,
        stratify=labels,
        random_state=random_state,
    )
    # Then split train/val from the remainder
    relative_val = val_size / (1 - test_size)
    train_p, val_p, train_l, val_l = train_test_split(
        train_val_p, train_val_l,
        test_size=relative_val,
        stratify=train_val_l,
        random_state=random_state,
    )

    return {
        "train": list(zip(train_p, train_l)),
        "val":   list(zip(val_p,   val_l)),
        "test":  list(zip(test_p,  test_l)),
    }


# ---------------------------------------------------------------------------
# 6. COPY — write final directory structure
# ---------------------------------------------------------------------------

def build_output(
    splits: dict[str, list[tuple[Path, str]]],
    output_root: Path,
) -> None:
    """
    Creates:
      output_root/
        train/plastic/  train/paper/  … (8 classes)
        val/plastic/    val/paper/    …
        test/plastic/   test/paper/   …
    """
    print("\n📁  Writing output directory structure...")
    output_root.mkdir(parents=True, exist_ok=True)

    for split_name, records in splits.items():
        for img_path, label in tqdm(records, desc=split_name, unit="img"):
            dest_dir = output_root / split_name / label
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = dest_dir / img_path.name
            # Avoid name collisions across source datasets
            if dest.exists():
                stem = img_path.stem
                suffix = img_path.suffix
                dest = dest_dir / f"{stem}_{random.randint(1000,9999)}{suffix}"
            shutil.copy2(img_path, dest)


# ---------------------------------------------------------------------------
# 7. REPORT — print + save summary JSON
# ---------------------------------------------------------------------------

def generate_report(
    splits: dict[str, list[tuple[Path, str]]],
    output_root: Path,
) -> None:
    report = {}
    print("\n📊  Dataset summary")
    print(f"{'Class':<16} {'Train':>7} {'Val':>7} {'Test':>7} {'Total':>8}")
    print("─" * 50)

    class_totals: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for split_name, records in splits.items():
        for _, label in records:
            class_totals[label][split_name] += 1

    grand_total = 0
    for cls in TARGET_CLASSES:
        counts = class_totals.get(cls, {})
        tr = counts.get("train", 0)
        va = counts.get("val",   0)
        te = counts.get("test",  0)
        tot = tr + va + te
        grand_total += tot
        print(f"{cls:<16} {tr:>7,} {va:>7,} {te:>7,} {tot:>8,}")
        report[cls] = {"train": tr, "val": va, "test": te, "total": tot}

    print("─" * 50)
    print(f"{'TOTAL':<16} {sum(v['train'] for v in report.values()):>7,} "
          f"{sum(v['val'] for v in report.values()):>7,} "
          f"{sum(v['test'] for v in report.values()):>7,} "
          f"{grand_total:>8,}")

    # Warn on small classes
    print("\n⚠  Classes with < 1,000 training images (augmentation recommended):")
    for cls, counts in report.items():
        if counts["train"] < 1000:
            print(f"   {cls}: {counts['train']} training images")

    report_path = output_root / "dataset_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n✅  Report saved → {report_path}")


# ---------------------------------------------------------------------------
# 8. AUGMENTATION HELPERS (for imbalanced classes like hazardous / e-waste)
# ---------------------------------------------------------------------------

def augment_small_classes(
    output_root: Path,
    min_train_count: int = 1500,
    target_split: str = "train",
) -> None:
    """
    For each class with fewer than min_train_count training images,
    generate augmented copies using basic transforms until the threshold
    is reached. Saves augmented images alongside originals.

    Augmentations applied randomly:
      - Horizontal flip
      - 90° / 180° / 270° rotation
      - ±20% brightness jitter
    """
    print(f"\n🔄  Augmenting classes below {min_train_count} training images...")

    for cls in TARGET_CLASSES:
        cls_dir = output_root / target_split / cls
        if not cls_dir.exists():
            continue

        existing = list(cls_dir.glob("*"))
        existing = [p for p in existing if p.suffix.lower() in VALID_EXTENSIONS]
        current = len(existing)

        if current >= min_train_count:
            continue

        needed = min_train_count - current
        print(f"   {cls}: {current} → generating {needed} augmented images")

        aug_count = 0
        while aug_count < needed:
            src = random.choice(existing)
            try:
                img = Image.open(src).convert("RGB")
            except Exception:
                continue

            # Random augmentation
            aug_type = random.randint(0, 5)
            if aug_type == 0:
                aug_img = img.transpose(Image.FLIP_LEFT_RIGHT)
            elif aug_type == 1:
                aug_img = img.rotate(90)
            elif aug_type == 2:
                aug_img = img.rotate(180)
            elif aug_type == 3:
                aug_img = img.rotate(270)
            elif aug_type == 4:
                # Brightness jitter
                from PIL import ImageEnhance
                factor = random.uniform(0.8, 1.2)
                aug_img = ImageEnhance.Brightness(img).enhance(factor)
            else:
                # Flip + rotate
                aug_img = img.transpose(Image.FLIP_LEFT_RIGHT).rotate(90)

            out_name = cls_dir / f"aug_{cls}_{aug_count:05d}.jpg"
            aug_img.save(out_name, "JPEG", quality=92)
            aug_count += 1

    print("   Augmentation complete.")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Waste dataset pipeline — merge, deduplicate, split"
    )
    parser.add_argument(
        "--datasets_root", type=str, default="./raw_datasets",
        help="Root folder containing all downloaded & unzipped datasets"
    )
    parser.add_argument(
        "--output", type=str, default="./dataset",
        help="Output folder for the final structured dataset"
    )
    parser.add_argument(
        "--no_dedup", action="store_true",
        help="Skip deduplication (faster, useful for testing)"
    )
    parser.add_argument(
        "--no_augment", action="store_true",
        help="Skip augmentation of small classes"
    )
    parser.add_argument(
        "--min_train", type=int, default=1500,
        help="Minimum training images per class before augmentation kicks in (default: 1500)"
    )
    parser.add_argument(
        "--hamming", type=int, default=8,
        help="Perceptual hash Hamming distance threshold for deduplication (default: 8)"
    )
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed for reproducibility"
    )
    args = parser.parse_args()

    random.seed(args.seed)
    datasets_root = Path(args.datasets_root)
    output_root   = Path(args.output)

    if not datasets_root.exists():
        print(f"❌  datasets_root not found: {datasets_root}")
        print("    Create it and place your unzipped dataset folders inside.")
        return

    # Step 1 — discover
    print(f"🔎  Scanning {datasets_root} for images...")
    records = discover_images(datasets_root)
    print(f"   Found {len(records):,} images across all datasets.")

    # Class breakdown before dedup
    class_counts: dict[str, int] = defaultdict(int)
    for _, label in records:
        class_counts[label] += 1
    print("\n   Pre-dedup class counts:")
    for cls in TARGET_CLASSES:
        print(f"     {cls:<16} {class_counts.get(cls, 0):>6,}")

    # Step 2 — deduplicate
    if not args.no_dedup:
        records = deduplicate(records, hamming_threshold=args.hamming)
    else:
        print("\n⏭  Skipping deduplication.")

    # Step 3 — split
    print("\n✂️   Creating stratified 70 / 15 / 15 split...")
    splits = stratified_split(records, random_state=args.seed)
    for split_name, recs in splits.items():
        print(f"   {split_name}: {len(recs):,} images")

    # Step 4 — copy to output
    build_output(splits, output_root)

    # Step 5 — augment small classes
    if not args.no_augment:
        augment_small_classes(output_root, min_train_count=args.min_train)
    else:
        print("\n⏭  Skipping augmentation.")

    # Step 6 — report
    # Re-read from output directory for accurate post-augmentation counts
    final_splits: dict[str, list[tuple[Path, str]]] = {}
    for split_name in ["train", "val", "test"]:
        final_splits[split_name] = []
        split_dir = output_root / split_name
        if not split_dir.exists():
            continue
        for cls_dir in split_dir.iterdir():
            if cls_dir.is_dir():
                for img in cls_dir.iterdir():
                    if img.suffix.lower() in VALID_EXTENSIONS:
                        final_splits[split_name].append((img, cls_dir.name))

    generate_report(final_splits, output_root)

    print(f"\n🎉  Pipeline complete. Dataset ready at: {output_root.resolve()}")
    print("""
    Final structure:
      dataset/
        train/plastic/  train/paper/  train/metal/  train/glass/
        train/organic/  train/e-waste/  train/hazardous/  train/general_trash/
        val/   (same 8 subdirs)
        test/  (same 8 subdirs)
        dataset_report.json
    """)


if __name__ == "__main__":
    main()
