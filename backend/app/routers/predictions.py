# app/routers/predictions.py
"""
Everything the frontend's Identify/Dashboard pages talk to:
  GET  /health              — server + model + db status
  POST /predict              — upload an image, get a waste prediction
  GET  /predictions          — list recent logged predictions
  GET  /predictions/{id}     — a single prediction record
"""
import io
import logging

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

from app.core.config import MODEL_PATH, VALID_IMAGE_CONTENT
from app.core.model import DEVICE, predict_image
from app.core.storage import upload_prediction_image
from app.data.category_meta import get_category_meta
from app.db.database import (
    DATABASE_URL,
    fetch_prediction,
    fetch_predictions,
    get_connection,
    log_prediction,
    save_result,
)
from app.schemas.schemas import PredictionRecord

router = APIRouter(tags=["predictions"])
logger = logging.getLogger("waste_api")


@router.get("/health")
async def health(request: Request) -> dict[str, str]:
    return {
        "status": "ok",
        "device": str(DEVICE),
        "model_path": str(MODEL_PATH),
        "database": DATABASE_URL.split("@")[-1],  # shows host/db, hides password
        "db_status": getattr(request.app.state, "db_status", "unknown"),
        "condition_model_status": getattr(request.app.state, "condition_model_status", "unknown"),
    }


@router.get("/predictions", response_model=list[PredictionRecord])
async def read_predictions(limit: int = 50, offset: int = 0) -> list[PredictionRecord]:
    records = fetch_predictions(get_connection(), limit=limit, offset=offset)
    return records


@router.get("/predictions/{prediction_id}", response_model=PredictionRecord)
async def read_prediction(prediction_id: int) -> PredictionRecord:
    record = fetch_prediction(get_connection(), prediction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return record


@router.post("/predict")
async def predict(
    request: Request,
    file: UploadFile = File(...),
    user_id: int = None,
) -> JSONResponse:
    if file.content_type not in VALID_IMAGE_CONTENT:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: {file.content_type}. "
                "Upload a JPEG, PNG, BMP, or WEBP image."
            ),
        )

    contents = await file.read()
    request_size = len(contents)
    state = request.app.state

    try:
        # 1. Get raw model prediction
        prediction_data = predict_image(
            contents,
            state.model,
            state.class_names,
            state.img_size,
            state.imagenet_mean,
            state.imagenet_std,
        )

        # 2. Get friendly metadata for predicted class
        meta = get_category_meta(prediction_data["predicted_class"])

        # 3. Reason about how much to trust this prediction
        reasoner = state.reasoner
        tier = reasoner.get_tier(prediction_data["predicted_class"], prediction_data["confidence"])
        full_result_partial = {**prediction_data, "tier": tier}

        # 4. Condition (clean/contaminated) is optional -- only present if
        # that checkpoint has been trained and loaded for this environment.
        condition_result = None
        if getattr(state, "condition_model_status", "unavailable") == "loaded":
            try:
                image = Image.open(io.BytesIO(contents)).convert("RGB")
                condition_result = state.condition_classifier.predict(image)
            except Exception as exc:
                logger.warning("Condition classification failed: %s", exc)

        # 5. Only upload to storage (and later save to history) for logged-in
        # users -- no point paying storage cost for anonymous scans.
        image_url = None
        if user_id:
            image_url = upload_prediction_image(contents, file.content_type, file.filename)

        # 6. Build full response the frontend expects
        full_result = {
            "name": meta["name"],
            "emoji": meta["emoji"],
            "type": meta["type"],
            "confidence": round(prediction_data["confidence"] * 100, 1),
            "instructions": meta["instructions"],
            "steps": meta["steps"],
            "points": meta["points"],
            "top3": prediction_data["top3"],
            "tier": tier,
            "tier_label": reasoner.get_prefix(tier),
            "is_safe": reasoner.is_safe(full_result_partial),
            "condition": condition_result,
            "image_url": image_url,
        }

        # 7. Log to Supabase predictions table
        log_prediction(
            get_connection(),
            filename=file.filename,
            content_type=file.content_type,
            predicted_class=prediction_data["predicted_class"],
            confidence=prediction_data["confidence"],
            top3=prediction_data["top3"],
            status="success",
            error=None,
            request_size=request_size,
        )

        # 8. If user_id provided, save to results table too
        if user_id:
            save_result(
                get_connection(),
                user_id=user_id,
                type=meta["type"],
                name=meta["name"],
                emoji=meta["emoji"],
                points=meta["points"],
                image_url=image_url,
                confidence=full_result["confidence"],
                tier=tier,
            )

        return JSONResponse(content=full_result)

    except HTTPException as error:
        log_prediction(
            get_connection(),
            filename=file.filename,
            content_type=file.content_type,
            predicted_class=None,
            confidence=None,
            top3=None,
            status="error",
            error=str(error.detail),
            request_size=request_size,
        )
        raise
