# app/main.py
"""
Application entrypoint. Run with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import CORS_ORIGINS, MODEL_PATH
from app.core.model import load_checkpoint
from app.db.database import get_connection, init_db
from app.routers import auth, predictions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("waste_api")

app = FastAPI(
    title="Waste Classification API",
    description="Upload an image and receive a waste category prediction.",
    version="0.1.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    # Frontend reads `data.error`; FastAPI's default body only has `detail`.
    # Return both so existing frontend code sees the real message instead
    # of falling back to a generic "failed" string.
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "detail": exc.detail},
    )


app.include_router(auth.router)
app.include_router(predictions.router)


@app.on_event("startup")
async def startup_event() -> None:
    app.state.model = None

    try:
        (
            app.state.model,
            app.state.class_names,
            app.state.img_size,
            app.state.imagenet_mean,
            app.state.imagenet_std,
        ) = load_checkpoint(MODEL_PATH)
        app.state.model_status = "loaded"
    except Exception as exc:
        app.state.model_status = "unavailable"
        app.state.model_error = str(exc)
        logger.error("Model failed to load: %s", exc)

    try:
        init_db(get_connection())
        app.state.db_status = "connected"
    except Exception as exc:
        app.state.db_status = "unavailable"
        app.state.db_error = str(exc)
        logger.error("Database failed to initialize: %s", exc)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
