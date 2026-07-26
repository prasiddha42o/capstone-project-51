# tests/test_core.py
"""
Lightweight tests that don't need torch or a live Postgres connection.
Run with: pytest tests/test_core.py
(Requires DATABASE_URL and JWT_SECRET_KEY to be set, since importing
app.core.config triggers Settings validation -- see conftest.py.)
"""
import json
from pathlib import Path

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.data.category_meta import CATEGORY_META, get_category_meta

MODELS_DIR = Path(__file__).resolve().parent.parent / "models_v2"


def test_password_hash_roundtrip():
    hashed = hash_password("correct-horse-battery-staple")
    assert verify_password("correct-horse-battery-staple", hashed)
    assert not verify_password("wrong-password", hashed)


def test_jwt_roundtrip():
    token = create_access_token(user_id=42, email="user@example.com")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["email"] == "user@example.com"


def test_jwt_rejects_garbage_token():
    assert decode_access_token("not.a.real.token") is None


def test_category_meta_known_class():
    meta = get_category_meta("plastic")
    assert meta["type"] == "plastic"
    assert meta["name"] == "Plastic Waste"


def test_category_meta_unknown_class_falls_back():
    meta = get_category_meta("something_the_model_never_outputs")
    assert meta == CATEGORY_META["general_trash"]


def test_category_meta_is_case_insensitive():
    assert get_category_meta("PLASTIC") == get_category_meta("plastic")


def test_class_indices_match_category_meta():
    """Every class the model can output must have category metadata."""
    with open(MODELS_DIR / "class_indices.json") as f:
        class_to_idx = json.load(f)

    for class_name in class_to_idx:
        assert class_name in CATEGORY_META, f"No CATEGORY_META entry for model class '{class_name}'"
