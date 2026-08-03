# category_meta.py
"""
Per-category display info: name, emoji, points, and disposal guidance.
`instructions` is a one-line summary (used anywhere space is tight);
`steps` is the full step-by-step guidance shown on the result card.
"""

CATEGORY_META = {
    "plastic": {
        "name": "Plastic Waste",
        "emoji": "🧴",
        "type": "plastic",
        "instructions": "Rinse, remove cap/label, place in recycling.",
        "steps": [
            "Empty out any leftover liquid or food residue.",
            "Rinse the item with water to remove residue -- dirty plastic can contaminate a whole batch of recycling.",
            "Remove and separately dispose of the cap and any paper label if they're a different material.",
            "Check the resin code (the number inside the recycling triangle, usually on the bottom) -- most curbside programs accept #1 (PET) and #2 (HDPE); others vary by area.",
            "Flatten the item if possible to save space.",
            "Place in your recycling bin, not general trash.",
        ],
        "points": 10,
        "weight": "~0.2kg",
        "color": "#4F46E5",
    },
    "paper": {
        "name": "Paper Waste",
        "emoji": "📄",
        "type": "paper",
        "instructions": "Keep dry, flatten, place in paper recycling.",
        "steps": [
            "Make sure the paper is dry -- wet or food-soiled paper (e.g. greasy pizza boxes) usually can't be recycled and should go in general trash or compost instead.",
            "Remove any non-paper attachments: plastic windows on envelopes, metal spiral bindings, tape, or plastic clips.",
            "Flatten boxes and stack loose sheets to save space.",
            "Keep it separate from plastic/glass/metal if your local system sorts by material.",
            "Place in your paper/cardboard recycling bin.",
        ],
        "points": 8,
        "weight": "~0.1kg",
        "color": "#3B82F6",
    },
    "glass": {
        "name": "Glass Waste",
        "emoji": "🍾",
        "type": "glass",
        "instructions": "Rinse and place in glass recycling, don't break.",
        "steps": [
            "Rinse out any remaining liquid or food.",
            "Leave labels on -- they burn/wash off during processing and don't need to be removed.",
            "Do not break the glass; whole containers are safer to handle and sort at the recycling facility.",
            "Separate by color if your local program requires it (clear, green, brown).",
            "Never mix in broken glass, mirrors, ceramics, or light bulbs -- these are different materials and can contaminate the batch; check for a dedicated drop-off if you have any.",
            "Place whole, rinsed containers in your glass recycling bin.",
        ],
        "points": 12,
        "weight": "~0.3kg",
        "color": "#10B981",
    },
    "metal": {
        "name": "Metal Waste",
        "emoji": "🥫",
        "type": "metal",
        "instructions": "Rinse cans and place in metal recycling.",
        "steps": [
            "Empty and rinse out any food or liquid residue.",
            "Labels can usually stay on -- they're removed during processing.",
            "Flatten cans if easy to do, to save space (not required).",
            "Separate sharp edges (e.g. from an opened can) by tucking the lid inside the can, if your local guidance recommends it.",
            "Place in your metal/cans recycling bin -- most aluminum and steel cans are widely recyclable.",
        ],
        "points": 15,
        "weight": "~0.15kg",
        "color": "#F59E0B",
    },
    "organic": {
        "name": "Organic Waste",
        "emoji": "🍎",
        "type": "organic",
        "instructions": "Compost if possible, otherwise green/food waste bin.",
        "steps": [
            "Remove any non-organic packaging (plastic wrap, stickers, twist ties) first.",
            "If you have a compost bin or municipal food-waste collection, place the item there.",
            "For home composting, avoid adding meat, dairy, or oily foods unless your setup specifically handles them, since they can attract pests or slow decomposition.",
            "If no composting option is available, place in general waste -- but check for a local green-waste or food-waste program first, since organic waste in landfill produces methane.",
        ],
        "points": 5,
        "weight": "~0.25kg",
        "color": "#84CC16",
    },
    "e-waste": {
        "name": "Electronic Waste",
        "emoji": "🔌",
        "type": "e-waste",
        "instructions": "Never bin it -- take to an e-waste drop-off point.",
        "steps": [
            "Never place electronics in general trash or regular recycling -- they contain materials (batteries, heavy metals) that require special handling.",
            "If the device has a removable battery, take it out and dispose of it separately (batteries often need their own drop-off point).",
            "Wipe or factory-reset any device that stored personal data before disposing of it.",
            "Look up a certified e-waste collection point, electronics retailer take-back program, or municipal e-waste event near you.",
            "For working but unwanted electronics, consider donating instead of discarding.",
        ],
        "points": 20,
        "weight": "~0.5kg",
        "color": "#8B5CF6",
    },
    "hazardous": {
        "name": "Hazardous Waste",
        "emoji": "☢️",
        "type": "hazardous",
        "instructions": "Never bin it -- take to a hazardous waste facility.",
        "steps": [
            "Do not place in any regular trash or recycling bin -- this includes batteries, paint, chemicals, pesticides, motor oil, and fluorescent bulbs.",
            "Keep the item in its original container if possible, so it stays clearly labeled.",
            "Do not mix different hazardous materials together.",
            "Store it safely (upright, sealed, out of reach of children/pets) until you can dispose of it properly.",
            "Locate your nearest household hazardous waste collection facility or scheduled community collection event -- many areas run these periodically.",
        ],
        "points": 25,
        "weight": "~0.3kg",
        "color": "#EF4444",
    },
    "general_trash": {
        "name": "General Trash",
        "emoji": "🗑️",
        "type": "general_trash",
        "instructions": "Place in general waste bin.",
        "steps": [
            "Double check it can't actually be recycled, composted, or specially handled first -- this category should be the last resort.",
            "Wrap any messy or sharp items to keep the bin (and collectors) safe.",
            "Place in your general waste bin.",
            "Consider whether a similar item could be avoided or reused next time to reduce waste at the source.",
        ],
        "points": 5,
        "weight": "~0.2kg",
        "color": "#6B7280",
    },
}


def get_category_meta(predicted_class: str) -> dict:
    """Looks up display metadata for a predicted class, case-insensitive.
    Falls back to General Trash if the class isn't recognized."""
    return CATEGORY_META.get(
        predicted_class.lower().strip(),
        CATEGORY_META["general_trash"],
    )
