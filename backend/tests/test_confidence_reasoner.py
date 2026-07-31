# tests/test_confidence_reasoner.py
from app.core.confidence_reasoner import ConfidenceReasoner


def test_default_thresholds():
    r = ConfidenceReasoner()
    assert r.high_threshold == 0.80
    assert r.medium_threshold == 0.60
    assert r.hazardous_offset == 0.10


def test_get_tier_non_hazardous():
    r = ConfidenceReasoner()
    assert r.get_tier("plastic", 0.85) == "high"
    assert r.get_tier("plastic", 0.65) == "medium"
    assert r.get_tier("plastic", 0.40) == "low"


def test_get_tier_hazardous_uses_lower_thresholds():
    r = ConfidenceReasoner()
    # 0.75 is below the normal 0.80 high threshold but above 0.80 - 0.10
    assert r.get_tier("hazardous", 0.75) == "high"
    assert r.get_tier("hazardous", 0.55) == "medium"
    assert r.get_tier("hazardous", 0.45) == "low"


def test_get_prefix_for_each_tier():
    r = ConfidenceReasoner()
    assert r.get_prefix("high").startswith("✅")
    assert r.get_prefix("medium").startswith("⚠️")
    assert r.get_prefix("low").startswith("❓")


def test_get_prefix_falls_back_for_unknown_tier():
    r = ConfidenceReasoner()
    assert r.get_prefix("nonsense") == r.get_prefix("low")


def test_is_safe_non_hazardous():
    r = ConfidenceReasoner()
    assert r.is_safe({"predicted_class": "plastic", "confidence": 0.85}) is True
    assert r.is_safe({"predicted_class": "plastic", "confidence": 0.65}) is True
    assert r.is_safe({"predicted_class": "plastic", "confidence": 0.40}) is False


def test_is_safe_hazardous_requires_high_tier():
    r = ConfidenceReasoner()
    assert r.is_safe({"predicted_class": "hazardous", "confidence": 0.75}) is True
    assert r.is_safe({"predicted_class": "hazardous", "confidence": 0.55}) is False
    assert r.is_safe({"predicted_class": "hazardous", "confidence": 0.20}) is False
