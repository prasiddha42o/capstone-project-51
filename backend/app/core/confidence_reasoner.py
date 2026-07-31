# app/core/confidence_reasoner.py
"""
Turns a raw model confidence score into a human-facing trust tier.

Hazardous predictions use lower thresholds (via `hazardous_offset`) than
other categories -- it's safer to flag something as hazardous at a lower
confidence than to miss it, since the cost of under-warning is higher than
the cost of over-warning. Mirrors the tiering logic prototyped in
model_and_data_pipeline/GreenNepal_Inference.ipynb.
"""

HAZARDOUS_CLASS = "hazardous"

TIER_PREFIXES = {
    "high": "✅ High Confidence",
    "medium": "⚠️ Medium Confidence — Please Verify",
    "low": "❓ Low Confidence — Manual Review Recommended",
}


class ConfidenceReasoner:
    def __init__(
        self,
        high_threshold: float = 0.80,
        medium_threshold: float = 0.60,
        hazardous_offset: float = 0.10,
    ):
        self.high_threshold = high_threshold
        self.medium_threshold = medium_threshold
        self.hazardous_offset = hazardous_offset

    def get_tier(self, cls: str, conf: float) -> str:
        offset = self.hazardous_offset if cls == HAZARDOUS_CLASS else 0.0
        high = self.high_threshold - offset
        medium = self.medium_threshold - offset

        if conf >= high:
            return "high"
        if conf >= medium:
            return "medium"
        return "low"

    def get_prefix(self, tier: str) -> str:
        return TIER_PREFIXES.get(tier, TIER_PREFIXES["low"])

    def is_safe(self, result: dict) -> bool:
        """A result is safe to present without extra caution unless it's a
        low-confidence call, or a hazardous call that isn't high-confidence."""
        predicted_class = result.get("predicted_class") or result.get("type")
        confidence = result.get("confidence", 0.0)
        tier = result.get("tier") or self.get_tier(predicted_class, confidence)

        if predicted_class == HAZARDOUS_CLASS:
            return tier == "high"
        return tier in ("high", "medium")
