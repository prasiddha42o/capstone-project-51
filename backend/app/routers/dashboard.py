# app/routers/dashboard.py
"""
Powers DashboardPage.jsx: GET /dashboard/{user_id}
Returns aggregate stats, a pie-chart breakdown by waste type, recent
history, and badge progress -- all derived from the `results` table.
"""
from fastapi import APIRouter, HTTPException

from app.data.category_meta import CATEGORY_META
from app.db.database import fetch_dashboard_stats, get_connection, user_exists

router = APIRouter(tags=["dashboard"])

MILESTONE = 50


def _color_for_type(waste_type: str) -> str:
    return CATEGORY_META.get(waste_type, CATEGORY_META["general_trash"])["color"]


def _weight_for_type(waste_type: str) -> str:
    return CATEGORY_META.get(waste_type, CATEGORY_META["general_trash"])["weight"]


def _calculate_badges(items_identified: int) -> list[dict]:
    return [
        {"name": "Starter", "emoji": "🌱", "earned": items_identified >= 1},
        {"name": "Recycler", "emoji": "♻️", "earned": items_identified >= 5},
        {"name": "Eco Hero", "emoji": "🏆", "earned": items_identified >= 10},
    ]


@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: int) -> dict:
    pool = get_connection()

    if not user_exists(pool, user_id):
        raise HTTPException(status_code=404, detail="User not found")

    data = fetch_dashboard_stats(pool, user_id)

    pie_data = [
        {
            "name": row["type"],
            "value": row["value"],
            "color": _color_for_type(row["type"]),
        }
        for row in data["type_counts"]
    ]

    history = [
        {
            "emoji": row["emoji"],
            "name": row["name"],
            "date": row["created_at"].strftime("%b %d, %Y"),
            "weight": _weight_for_type(row["type"]),
            "points": row["points"],
        }
        for row in data["history_rows"]
    ]

    return {
        "stats": {
            "total_points": data["total_points"],
            "items_identified": data["items_identified"],
            "milestone": MILESTONE,
        },
        "pie_data": pie_data,
        "history": history,
        "badges": _calculate_badges(data["items_identified"]),
    }
