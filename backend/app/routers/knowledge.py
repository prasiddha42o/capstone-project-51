# app/routers/knowledge.py
"""
Disposal-guidance knowledge base -- lets the frontend browse every waste
category's disposal guidance directly, not just after a prediction:
  GET /knowledge-base            — every category, with full guidance
  GET /knowledge-base/{category} — a single category's guidance
"""
from fastapi import APIRouter, HTTPException

from app.data.category_meta import CATEGORY_META

router = APIRouter(tags=["knowledge-base"])


@router.get("/knowledge-base")
async def list_knowledge_base() -> list[dict]:
    return [{"id": category, **meta} for category, meta in CATEGORY_META.items()]


@router.get("/knowledge-base/{category}")
async def get_knowledge_base_entry(category: str) -> dict:
    key = category.lower().strip()
    meta = CATEGORY_META.get(key)
    if not meta:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"id": key, **meta}
