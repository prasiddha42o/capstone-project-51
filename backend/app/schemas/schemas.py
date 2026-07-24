from typing import Any

from pydantic import BaseModel


class TopPrediction(BaseModel):
    class_name: str | None = None
    confidence: float


class PredictionResult(BaseModel):
    predicted_class: str
    confidence: float
    top3: list[dict[str, Any]]


class PredictionRecord(BaseModel):
    id: int
    created_at: str
    filename: str | None
    content_type: str | None
    predicted_class: str | None
    confidence: float | None
    top3: list[dict[str, Any]]
    status: str
    error: str | None
    request_size: int
