# app/main.py
"""
Application entrypoint. Run with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
or:
    python -m app.main
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, MODEL_PATH
from app.core.model import load_checkpoint
from app.db.database import get_connection, init_db
from app.routers import auth, predictions

app = FastAPI(
    title="Waste Classification API",
    description="Upload an image and receive a waste category prediction.",
    version="0.1.0",
)

# CORS — allows the frontend dev server to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predictions.router)


@app.on_event("startup")
async def startup_event() -> None:
    try:
        (
            app.state.model,
            app.state.class_names,
            app.state.img_size,
            app.state.imagenet_mean,
            app.state.imagenet_std,
        ) = load_checkpoint(MODEL_PATH)
        init_db(get_connection())
        app.state.db_status = "connected"
    except Exception as exc:
        app.state.db_status = "unavailable"
        app.state.db_error = str(exc)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
