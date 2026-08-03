# app/core/storage.py
"""
Uploads prediction images to Supabase Storage so a user's history can show
the original photo later. Best-effort: a failed/misconfigured upload
returns None rather than raising, so /predict keeps working without it.
"""
import logging
import uuid

import httpx

from app.core.config import SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET, SUPABASE_URL

logger = logging.getLogger("waste_api")

EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/bmp": "bmp",
    "image/webp": "webp",
}


def _guess_extension(filename: str | None, content_type: str | None) -> str:
    if filename and "." in filename:
        return filename.rsplit(".", 1)[-1].lower()
    return EXTENSION_BY_CONTENT_TYPE.get(content_type or "", "jpg")


def upload_prediction_image(
    image_bytes: bytes,
    content_type: str | None,
    filename: str | None = None,
) -> str | None:
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        return None

    extension = _guess_extension(filename, content_type)
    object_path = f"{uuid.uuid4()}.{extension}"
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{object_path}"

    try:
        response = httpx.post(
            upload_url,
            content=image_bytes,
            headers={
                "apikey": SUPABASE_SECRET_KEY,
                "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
                "Content-Type": content_type or "application/octet-stream",
            },
            timeout=10.0,
        )
        response.raise_for_status()
    except Exception as exc:
        logger.warning("Image upload to storage failed (non-fatal): %s", exc)
        return None

    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/{object_path}"
