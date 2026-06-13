"""
Waste Classification Dataset Pipeline  —  12-Dataset Edition
=============================================================
Group 51 — AI-Based Waste Classification System

STEP-BY-STEP OVERVIEW
─────────────────────
  Step 1 ▸ CLASS_MAP      — Translate every source folder name in all 12 datasets
                             to one of 8 unified target classes.
  Step 2 ▸ discover_images — Walk the raw_datasets folder recursively, attach a
                             target class label to every valid image file.
  Step 3 ▸ deduplicate    — Compute a perceptual hash for every image and drop
                             near-duplicate copies (catches same photo re-uploaded
                             across different datasets).
  Step 4 ▸ stratified_split — Split the unique images 70 % train / 15 % val /
                             15 % test, keeping each class balanced in every split.
  Step 5 ▸ build_output   — Copy files into the final folder hierarchy.
  Step 6 ▸ augment_small_classes — For any class that still has fewer than
                             min_train images, generate augmented copies (flips,
                             rotations, brightness jitter) until the threshold
                             is reached.
  Step 7 ▸ generate_report — Print a per-class breakdown table and save it as
                             dataset_report.json.
                             

Target classes (8 total):
  plastic | paper | metal | glass | organic | e-waste | hazardous | general_trash

───────────────────────────────────────────────────────────────────────────────
DATASET → SUBFOLDER MAPPING  (unzip each dataset into raw_datasets/ exactly as shown)
───────────────────────────────────────────────────────────────────────────────
  ID  Source                                               Subfolder name
  ─── ──────────────────────────────────────────────────── ───────────────────
   1  kaggle: feyzazkefe/trashnet                          trashnet/
   2  kaggle: techsash/waste-classification-data           waste_sekar/
   3  kaggle: sumn2u/garbage-classification-v2             garbage_v2/
   4  kaggle: akshat103/e-waste-image-dataset              ewaste/
   5  github: pedropro/TACO  (use the 'data' folder)       taco/
   6  kaggle: mostafaabla/garbage-classification           garbage_mostafa/
   7  kaggle: asdasdasasdas/garbage-classification         recyclable_household/
   8  kaggle: alistairking/recyclable-household-waste      alistair_waste/
   9  uci:    joebeachcapital/realwaste                    realwaste/
  10  kaggle: angelikasita/waste-images                    waste_images/
  11  kaggle: sanjadrag24/recyclable-waste-images          recycle_waste_images/
  12  github: openrecycle/dataset                          openrecycle/

Usage:
  pip install Pillow imagehash scikit-learn tqdm
  python waste_data_pipeline_12datasets.py \\
         --datasets_root ./raw_datasets \\
         --output ./dataset
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


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — CLASS MAP
# ───────────────────
# Every key is a folder name (lowercase, underscores) that appears in at least
# one of the 12 source datasets.  Every value is one of the 8 target classes.
# The resolve_class() function handles case and hyphen/space variants
# automatically, so you only need to list the canonical form here.
# ═══════════════════════════════════════════════════════════════════════════════

CLASS_MAP = {

    # ── Dataset 1 · TrashNet (feyzazkefe/trashnet) ────────────────────────────
    # Folder structure: dataset-resized/{class}/  or  trash/{class}/
    "plastic":              "plastic",
    "paper":                "paper",
    "metal":                "metal",
    "glass":                "glass",
    "cardboard":            "paper",        # cardboard → paper (same recycling stream)
    "trash":                "general_trash",

    # ── Dataset 2 · Waste-Sekar (techsash/waste-classification-data) ──────────
    # Two top-level folders: TRAIN/ and TEST/, each with O/ and R/ subfolders.
    "o":                    "organic",      # O = organic waste
    "r":                    "plastic",      # R = recyclable (predominantly plastic)

    # ── Dataset 3 · Garbage-Classification-v2 (sumn2u) ────────────────────────
    # 12 class folders.
    "biological":           "organic",
    "brown_glass":          "glass",
    "brown-glass":          "glass",
    "green_glass":          "glass",
    "green-glass":          "glass",
    "white_glass":          "glass",
    "white-glass":          "glass",
    "battery":              "hazardous",
    "clothes":              "general_trash",
    "shoes":                "general_trash",
    # paper / metal / plastic / glass / cardboard / trash already covered above

    # ── Dataset 4 · E-Waste (akshat103/e-waste-image-dataset) ─────────────────
    # Sub-folders by device type.
    "chips":                "e-waste",
    "cpu":                  "e-waste",
    "laptop":               "e-waste",
    "mobile":               "e-waste",
    "phone":                "e-waste",
    "pcb":                  "e-waste",
    "wire":                 "e-waste",
    "appliance":            "e-waste",
    "keyboard":             "e-waste",
    "monitor":              "e-waste",
    "printer":              "e-waste",
    "television":           "e-waste",
    "electronic":           "e-waste",
    "ewaste":               "e-waste",
    "e_waste":              "e-waste",
    "e-waste":              "e-waste",
    "circuit_board":        "e-waste",
    "circuit":              "e-waste",
    "hard_drive":           "e-waste",
    "harddrive":            "e-waste",
    "mouse":                "e-waste",
    "tablet":               "e-waste",
    "camera":               "e-waste",

    # ── Dataset 5 · TACO (pedropro/TACO) ──────────────────────────────────────
    # Organised by annotation; folder names are fine-grained subcategories.
    "plastic_bag":          "plastic",
    "plastic_bottle":       "plastic",
    "plastic_cup":          "plastic",
    "plastic_straw":        "plastic",
    "plastic_utensil":      "plastic",
    "plastic_film":         "plastic",
    "plastic_container":    "plastic",
    "plastic_lid":          "plastic",
    "six_pack_rings":       "plastic",
    "drink_can":            "metal",
    "food_can":             "metal",
    "aerosol":              "hazardous",
    "light_bulb":           "hazardous",
    "medicine":             "hazardous",
    "chemical":             "hazardous",
    "newspaper":            "paper",
    "magazine":             "paper",
    "cardboard_box":        "paper",
    "paper_bag":            "paper",
    "tissue":               "paper",
    "cup":                  "paper",          # paper cups in TACO
    "glass_bottle":         "glass",
    "glass_jar":            "glass",
    "glass_cup":            "glass",
    "food_waste":           "organic",
    "organic":              "organic",
    "rope":                 "general_trash",
    "shoe":                 "general_trash",
    "clothing":             "general_trash",
    "unlabeled":            "general_trash",
    "other":                "general_trash",
    "foam":                 "general_trash",

    # ── Dataset 6 · Garbage-Classification (mostafaabla) ──────────────────────
    # 12 labelled classes; many overlap with TrashNet / v2.
    "food_organics":        "organic",
    "food organics":        "organic",
    "food_organic":         "organic",
    "vegetable":            "organic",
    "fruit":                "organic",
    "compost":              "organic",
    "soft_plastics":        "plastic",
    "soft plastics":        "plastic",
    "hard_plastics":        "plastic",
    "hard plastics":        "plastic",
    "rubber":               "plastic",
    "paper_cardboard":      "paper",
    "paper & cardboard":    "paper",
    "paper_and_cardboard":  "paper",
    "glass_bottles":        "glass",
    "glass bottles":        "glass",
    "cans":                 "metal",
    "aluminium":            "metal",
    "aluminum":             "metal",
    "tin":                  "metal",
    "textiles":             "general_trash",
    "misc_trash":           "general_trash",
    "misc trash":           "general_trash",
    "miscellaneous":        "general_trash",

    # ── Dataset 7 · Recyclable & Household (asdasdasasdas) ────────────────────
    # Two splits: recyclable/ and household/.  Sub-folders per material type.
    "recyclable":           None,           # parent folder — resolved by child
    "household":            None,           # parent folder — resolved by child
    "non_recyclable":       "general_trash",
    "non-recyclable":       "general_trash",
    "ceramic":              "general_trash",
    "styrofoam":            "general_trash",
    "wood":                 "general_trash",
    "furniture":            "general_trash",
    "diaper":               "general_trash",
    "sanitary":             "general_trash",
    "paint":                "hazardous",
    "solvent":              "hazardous",
    "pesticide":            "hazardous",
    "oil":                  "hazardous",
    "cleaner":              "hazardous",
    "bleach":               "hazardous",

    # ── Dataset 8 · Alistair Recyclable & Household Waste ─────────────────────
    # Very granular sub-categories; many already covered above.
    "aluminum_foil":        "metal",
    "aluminium_foil":       "metal",
    "steel":                "metal",
    "iron":                 "metal",
    "copper":               "metal",
    "scrap_metal":          "metal",
    "wine_bottle":          "glass",
    "beer_bottle":          "glass",
    "mirror":               "glass",
    "window_glass":         "glass",
    "egg_carton":           "paper",
    "newspaper_roll":       "paper",
    "book":                 "paper",
    "envelope":             "paper",
    "receipt":              "paper",
    "tetra_pak":            "paper",          # composite but labelled paper here
    "milk_carton":          "paper",
    "juice_carton":         "paper",
    "takeout_container":    "plastic",
    "water_bottle":         "plastic",
    "shampoo_bottle":       "plastic",
    "detergent_bottle":     "plastic",
    "toys":                 "general_trash",
    "toy":                  "general_trash",
    "mattress":             "general_trash",
    "pillow":               "general_trash",

    # ── Dataset 9 · RealWaste (UCI / joebeachcapital) ─────────────────────────
    # 9-class real-world images.
    # Most names already listed above; just the remainder:
    "landfill":             "general_trash",

    # ── Dataset 10 · Waste Images (angelikasita) ──────────────────────────────
    # Binary organic / recyclable split plus a small 'garbage' folder.
    "garbage":              "general_trash",
    "rubbish":              "general_trash",
    "waste":                "general_trash",

    # ── Dataset 11 · Recyclable Waste Images (sanjadrag24) ────────────────────
    # 6 recyclable categories.
    "e_scrap":              "e-waste",
    "e-scrap":              "e-waste",
    "nylon":                "plastic",
    "polystyrene":          "plastic",
    "pvc":                  "plastic",
    "brown_paper":          "paper",
    "white_paper":          "paper",
    "corrugated":           "paper",
    "steel_can":            "metal",
    "aluminium_can":        "metal",
    "aluminum_can":         "metal",
    "clear_glass":          "glass",
    "colored_glass":        "glass",

    # ── Dataset 12 · OpenRecycle (github openrecycle/dataset) ─────────────────
    # Community-labelled multi-language dataset; categories overlap heavily.
    "pet_bottle":           "plastic",
    "hdpe":                 "plastic",
    "ldpe":                 "plastic",
    "pp":                   "plastic",
    "ps":                   "plastic",
    "corrugated_cardboard": "paper",
    "mixed_paper":          "paper",
    "newsprint":            "paper",
    "ferrous":              "metal",
    "non_ferrous":          "metal",
    "flat_glass":           "glass",
    "container_glass":      "glass",
    "kitchen_waste":        "organic",
    "garden_waste":         "organic",
    "yard_waste":           "organic",
    "cfl":                  "hazardous",      # compact fluorescent lamp
    "fluorescent_tube":     "hazardous",
    "ink_cartridge":        "hazardous",
    "toner":                "hazardous",
    "pharmaceutical":       "hazardous",
    "drug":                 "hazardous",
    "syringe":              "hazardous",
    "computer":             "e-waste",
    "server":               "e-waste",
    "router":               "e-waste",
    "cable":                "e-waste",
    "charger":              "e-waste",
    "headphone":            "e-waste",
    "speaker":              "e-waste",
    "refrigerator":         "e-waste",
    "washing_machine":      "e-waste",
    "microwave":            "e-waste",
    "bulky_waste":          "general_trash",
    "mixed_waste":          "general_trash",
}

TARGET_CLASSES = [
    "plastic", "paper", "metal", "glass",
    "organic", "e-waste", "hazardous", "general_trash"
]

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2A — HELPER FUNCTIONS
# ───────────────────────────
# Small utility functions used throughout the pipeline.
# ═══════════════════════════════════════════════════════════════════════════════

def normalize_key(name: str) -> str:
    """
    Convert a raw folder name to a lowercase, underscore-separated key so that
    'Plastic_Bottle', 'plastic-bottle', and 'plastic bottle' all map to the
    same dictionary key 'plastic_bottle'.
    """
    return name.lower().replace("-", "_").replace(" ", "_").strip()


def resolve_class(folder_name: str):
    """
    Look up a raw folder name in CLASS_MAP.
    1. Try an exact (normalised) match first.
    2. Fall back to a substring match (e.g. 'Plastic_bottle_v2' → 'plastic').
    Returns the target class string, or None if no match is found.
    """
    key = normalize_key(folder_name)

    # Exact match
    if key in CLASS_MAP and CLASS_MAP[key] is not None:
        return CLASS_MAP[key]

    # Substring / partial match — useful for versioned or compound folder names
    for src, tgt in CLASS_MAP.items():
        if tgt is not None and src in key:
            return tgt

    return None  # unresolvable — caller will warn and skip


def phash(image_path: Path, hash_size: int = 8) -> str:
    """
    Compute a perceptual hash (pHash) for an image.
    pHash captures visual content, so a resized or re-saved copy of the same
    photo will produce a very similar hash, letting us detect cross-dataset
    duplicates.
    Falls back to MD5 (byte-level) if the image is corrupt/unreadable.
    """
    try:
        img = Image.open(image_path).convert("RGB")
        return str(imagehash.phash(img, hash_size=hash_size))
    except Exception:
        return hashlib.md5(image_path.read_bytes()).hexdigest()


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2B — IMAGE DISCOVERY
# ──────────────────────────
# Walk every sub-folder inside raw_datasets/, find all image files, and attach
# a target class label to each one by climbing up its directory tree until a
# recognisable folder name is found.
# ═══════════════════════════════════════════════════════════════════════════════

def discover_images(datasets_root: Path) -> list[tuple[Path, str]]:
    """
    Recursively walk datasets_root.  For every image file:
      • Climb up the directory tree (toward datasets_root).
      • At each level, try resolve_class() on the folder name.
      • Stop at the first match — that becomes the image's label.

    Returns a list of (image_path, target_class) tuples.
    Unresolvable images are skipped; their parent folder names are printed
    so you can add them to CLASS_MAP if needed.
    """
    records = []
    unresolved_folders: set[str] = set()

    for img_path in datasets_root.rglob("*"):
        if img_path.suffix.lower() not in VALID_EXTENSIONS:
            continue
        if not img_path.is_file():
            continue

        target = None
        for parent in img_path.parents:
            if parent == datasets_root:
                break                        # reached the root — give up
            target = resolve_class(parent.name)
            if target:
                break

        if target:
            records.append((img_path, target))
        else:
            unresolved_folders.add(img_path.parent.name)

    if unresolved_folders:
        print("\n⚠  Could not map these folder names → class (images skipped):")
        for f in sorted(unresolved_folders):
            print(f"     '{f}'  ← add to CLASS_MAP if you want these images")

    return records


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — DEDUPLICATION
# ───────────────────────
# Many Kaggle datasets re-host the same images.  We hash every image and discard
# any new image whose hash is within `hamming_threshold` bits of an already-seen
# hash.  A threshold of 8 (out of 64 bits) catches rescaled / recompressed copies
# while keeping genuinely different photos.
# ═══════════════════════════════════════════════════════════════════════════════

def deduplicate(
    records: list[tuple[Path, str]],
    hamming_threshold: int = 8,
) -> list[tuple[Path, str]]:
    """
    Remove near-duplicate images using perceptual hashing.

    Algorithm:
      For each image compute its pHash.
      Compare it against every already-accepted hash.
      If the minimum Hamming distance is ≤ hamming_threshold → duplicate, skip.
      Otherwise add to the accepted list.

    Returns only the unique records.
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
            # MD5 fallback — treat as unique (no distance comparison possible)
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

    print(f"   Removed {duplicates:,} duplicates.  Kept {len(unique_records):,} unique images.")
    return unique_records


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — STRATIFIED TRAIN / VAL / TEST SPLIT
# ──────────────────────────────────────────────
# Split 70 % → train, 15 % → val, 15 % → test.
# 'Stratified' means each class keeps its proportional representation in every
# split, so a rare class is never accidentally left out of val or test.
# ═══════════════════════════════════════════════════════════════════════════════

def stratified_split(
    records: list[tuple[Path, str]],
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> dict[str, list[tuple[Path, str]]]:
    """
    Two-stage stratified split:
      Stage 1 — carve out the test set (15 %).
      Stage 2 — split the remainder into train (70 %) and val (15 %).

    Returns {'train': [...], 'val': [...], 'test': [...]}.
    """
    paths  = [r[0] for r in records]
    labels = [r[1] for r in records]

    # Stage 1 — separate test
    train_val_p, test_p, train_val_l, test_l = train_test_split(
        paths, labels,
        test_size=test_size,
        stratify=labels,
        random_state=random_state,
    )

    # Stage 2 — separate val from the remaining 85 %
    # relative_val keeps the final val proportion at 15 % of the full dataset
    relative_val = val_size / (1.0 - test_size)
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


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — BUILD OUTPUT DIRECTORY
# ─────────────────────────────────
# Copy every image into its final location:
#   dataset/
#     train/plastic/  train/paper/  … (8 subdirs)
#     val/plastic/    val/paper/    …
#     test/plastic/   test/paper/   …
# Filename collisions (same base name from different datasets) are resolved by
# appending a random 4-digit suffix.
# ═══════════════════════════════════════════════════════════════════════════════

def build_output(
    splits: dict[str, list[tuple[Path, str]]],
    output_root: Path,
) -> None:
    """
    Create the output folder structure and copy every image to its destination.
    Uses shutil.copy2 to preserve metadata (timestamps).
    """
    print("\n📁  Writing output directory structure...")
    output_root.mkdir(parents=True, exist_ok=True)

    for split_name, records in splits.items():
        for img_path, label in tqdm(records, desc=split_name, unit="img"):
            dest_dir = output_root / split_name / label
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = dest_dir / img_path.name

            # Resolve name collisions
            if dest.exists():
                stem   = img_path.stem
                suffix = img_path.suffix
                dest   = dest_dir / f"{stem}_{random.randint(1000, 9999)}{suffix}"

            shutil.copy2(img_path, dest)


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — AUGMENT UNDER-REPRESENTED CLASSES
# ────────────────────────────────────────────
# Classes like 'hazardous' and 'e-waste' may have far fewer images than 'plastic'
# or 'paper'.  To prevent the model from under-learning these classes we
# synthetically expand the training set using simple geometric and colour
# transforms.  Only the training split is augmented — val and test stay clean.
#
# Augmentation types (chosen at random per generated image):
#   0 — Horizontal flip
#   1 — 90° rotation
#   2 — 180° rotation
#   3 — 270° rotation
#   4 — Brightness jitter (±20 %)
#   5 — Horizontal flip + 90° rotation  (combined)
# ═══════════════════════════════════════════════════════════════════════════════

def augment_small_classes(
    output_root: Path,
    min_train_count: int = 1500,
    target_split: str = "train",
) -> None:
    """
    For each training class with fewer than min_train_count images, generate
    augmented copies until the threshold is reached.
    Augmented files are saved alongside originals as aug_<class>_NNNNN.jpg.
    """
    from PIL import ImageEnhance  # only needed here, so imported locally

    print(f"\n🔄  Augmenting classes with fewer than {min_train_count} training images...")

    for cls in TARGET_CLASSES:
        cls_dir = output_root / target_split / cls
        if not cls_dir.exists():
            continue

        existing = [
            p for p in cls_dir.glob("*")
            if p.suffix.lower() in VALID_EXTENSIONS
        ]
        current = len(existing)
        if current >= min_train_count:
            continue

        needed = min_train_count - current
        print(f"   {cls}: {current} images → generating {needed} augmented copies")

        aug_count = 0
        while aug_count < needed:
            src = random.choice(existing)
            try:
                img = Image.open(src).convert("RGB")
            except Exception:
                continue

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
                factor  = random.uniform(0.80, 1.20)
                aug_img = ImageEnhance.Brightness(img).enhance(factor)
            else:
                aug_img = img.transpose(Image.FLIP_LEFT_RIGHT).rotate(90)

            out_path = cls_dir / f"aug_{cls}_{aug_count:05d}.jpg"
            aug_img.save(out_path, "JPEG", quality=92)
            aug_count += 1

    print("   ✔ Augmentation complete.")


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — REPORT
# ────────────────
# Count images per class per split, print a summary table, warn about classes
# that are still small (even after augmentation), and save a JSON report.
# ═══════════════════════════════════════════════════════════════════════════════

def generate_report(
    splits: dict[str, list[tuple[Path, str]]],
    output_root: Path,
) -> None:
    """
    Print a per-class breakdown table and save dataset_report.json.
    Also flags any class with fewer than 1 000 training images so you know
    where additional data collection or heavier augmentation is needed.
    """
    report: dict[str, dict[str, int]] = {}
    class_totals: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for split_name, records in splits.items():
        for _, label in records:
            class_totals[label][split_name] += 1

    print("\n📊  Dataset Summary")
    print(f"{'Class':<18} {'Train':>8} {'Val':>8} {'Test':>8} {'Total':>9}")
    print("─" * 57)

    grand_total = 0
    for cls in TARGET_CLASSES:
        counts = class_totals.get(cls, {})
        tr  = counts.get("train", 0)
        va  = counts.get("val",   0)
        te  = counts.get("test",  0)
        tot = tr + va + te
        grand_total += tot
        print(f"{cls:<18} {tr:>8,} {va:>8,} {te:>8,} {tot:>9,}")
        report[cls] = {"train": tr, "val": va, "test": te, "total": tot}

    print("─" * 57)
    print(
        f"{'TOTAL':<18} "
        f"{sum(v['train'] for v in report.values()):>8,} "
        f"{sum(v['val']   for v in report.values()):>8,} "
        f"{sum(v['test']  for v in report.values()):>8,} "
        f"{grand_total:>9,}"
    )

    # Flag small classes
    small = [cls for cls, c in report.items() if c["train"] < 1000]
    if small:
        print("\n⚠  Classes with < 1,000 training images (consider more data or augmentation):")
        for cls in small:
            print(f"   {cls}: {report[cls]['train']:,} training images")

    # Save JSON
    report_path = output_root / "dataset_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n✅  Report saved → {report_path}")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ─────────────────
# Parses command-line arguments and runs Steps 2–7 in sequence.
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Waste dataset pipeline — 12 datasets, 8 classes"
    )
    parser.add_argument(
        "--datasets_root", type=str, default="./raw_datasets",
        help="Root folder containing all 12 downloaded & unzipped dataset sub-folders"
    )
    parser.add_argument(
        "--output", type=str, default="./dataset",
        help="Output folder for the final structured dataset (default: ./dataset)"
    )
    parser.add_argument(
        "--no_dedup", action="store_true",
        help="Skip perceptual-hash deduplication (faster but may include copies)"
    )
    parser.add_argument(
        "--no_augment", action="store_true",
        help="Skip augmentation of under-represented classes"
    )
    parser.add_argument(
        "--min_train", type=int, default=1500,
        help="Minimum training images per class before augmentation kicks in (default: 1500)"
    )
    parser.add_argument(
        "--hamming", type=int, default=8,
        help="pHash Hamming distance threshold for duplicate detection (default: 8)"
    )
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed for reproducible splits (default: 42)"
    )
    args = parser.parse_args()

    random.seed(args.seed)
    datasets_root = Path(args.datasets_root)
    output_root   = Path(args.output)

    # ── Sanity check ──────────────────────────────────────────────────────────
    if not datasets_root.exists():
        print(f"❌  datasets_root not found: {datasets_root}")
        print("    Create it and place your 12 unzipped dataset folders inside.")
        print("    Expected sub-folders:")
        for name in [
            "trashnet", "waste_sekar", "garbage_v2", "ewaste", "taco",
            "garbage_mostafa", "recyclable_household", "alistair_waste",
            "realwaste", "waste_images", "recycle_waste_images", "openrecycle",
        ]:
            print(f"      {datasets_root / name}")
        return

    # ── Step 2 — Discover ─────────────────────────────────────────────────────
    print(f"\n🔎  Scanning {datasets_root} for images...")
    records = discover_images(datasets_root)
    print(f"   Found {len(records):,} images across all 12 datasets.")

    # Pre-dedup class breakdown (informational)
    pre_counts: dict[str, int] = defaultdict(int)
    for _, label in records:
        pre_counts[label] += 1
    print("\n   Pre-deduplication class counts:")
    for cls in TARGET_CLASSES:
        print(f"     {cls:<18} {pre_counts.get(cls, 0):>7,}")

    # ── Step 3 — Deduplicate ──────────────────────────────────────────────────
    if not args.no_dedup:
        records = deduplicate(records, hamming_threshold=args.hamming)
    else:
        print("\n⏭  Skipping deduplication (--no_dedup flag set).")

    # ── Step 4 — Stratified split ─────────────────────────────────────────────
    print("\n✂️   Creating stratified 70 / 15 / 15 split...")
    splits = stratified_split(records, random_state=args.seed)
    for split_name, recs in splits.items():
        print(f"   {split_name:<6}: {len(recs):,} images")

    # ── Step 5 — Copy to output ───────────────────────────────────────────────
    build_output(splits, output_root)

    # ── Step 6 — Augment small classes ───────────────────────────────────────
    if not args.no_augment:
        augment_small_classes(output_root, min_train_count=args.min_train)
    else:
        print("\n⏭  Skipping augmentation (--no_augment flag set).")

    # ── Step 7 — Report ───────────────────────────────────────────────────────
    # Re-read from the output directory so the count includes augmented images.
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

    print(f"\n🎉  Pipeline complete!  Dataset ready at: {output_root.resolve()}")
    print("""
    Final folder structure
    ──────────────────────
    dataset/
      train/
        plastic/   paper/   metal/   glass/
        organic/   e-waste/ hazardous/ general_trash/
      val/
        (same 8 sub-folders)
      test/
        (same 8 sub-folders)
      dataset_report.json
    """)


if __name__ == "__main__":
    main()