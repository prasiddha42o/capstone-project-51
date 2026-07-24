# category_meta.py

CATEGORY_META = {
    "plastic": {
        "name": "Plastic Waste",
        "emoji": "🧴",
        "type": "plastic",
        "instructions": "Rinse and place in recycling bin. Remove caps and labels if possible.",
        "points": 10,
        "weight": "~0.2kg",
        "color": "#4F46E5",
    },
    "paper": {
        "name": "Paper Waste",
        "emoji": "📄",
        "type": "paper",
        "instructions": "Flatten and place in paper recycling. Keep dry and clean.",
        "points": 8,
        "weight": "~0.1kg",
        "color": "#3B82F6",
    },
    "metal": {
        "name": "Metal Waste",
        "emoji": "🥫",
        "type": "metal",
        "instructions": "Rinse cans and tins. Place in metal recycling bin.",
        "points": 15,
        "weight": "~0.3kg",
        "color": "#10B981",
    },
    "glass": {
        "name": "Glass Waste",
        "emoji": "🍶",
        "type": "glass",
        "instructions": "Rinse bottles and jars. Place in glass recycling bin.",
        "points": 12,
        "weight": "~0.4kg",
        "color": "#06B6D4",
    },
    "organic": {
        "name": "Organic Waste",
        "emoji": "🌿",
        "type": "organic",
        "instructions": "Compost food scraps and garden waste. Use a compost bin.",
        "points": 8,
        "weight": "~0.3kg",
        "color": "#F59E0B",
    },
    "e-waste": {
        "name": "Electronic Waste",
        "emoji": "💻",
        "type": "e-waste",
        "instructions": "Take to designated e-waste collection point. Never bin electronics.",
        "points": 20,
        "weight": "~0.5kg",
        "color": "#8B5CF6",
    },
    "hazardous": {
        "name": "Hazardous Waste",
        "emoji": "☣️",
        "type": "hazardous",
        "instructions": "Take to hazardous waste facility. Never mix with regular trash.",
        "points": 25,
        "weight": "~0.2kg",
        "color": "#EF4444",
    },
    "general_trash": {
        "name": "General Trash",
        "emoji": "🗑️",
        "type": "general_trash",
        "instructions": "Place in general waste bin. Try to reduce this type of waste.",
        "points": 5,
        "weight": "~0.2kg",
        "color": "#6B7280",
    },
}


def get_category_meta(predicted_class: str) -> dict:
    """
    Returns metadata for a predicted class.
    Falls back to general_trash if class not found.
    """
    return CATEGORY_META.get(predicted_class.lower(), CATEGORY_META["general_trash"])