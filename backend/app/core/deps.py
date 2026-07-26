# app/core/deps.py
"""
Shared FastAPI dependencies for reading the current user off the
Authorization header.

- get_current_user           -> 401s if there's no valid token (protected routes)
- get_current_user_optional   -> returns None if there's no/invalid token
                                 (routes that work anonymously but attach a
                                 user when logged in, e.g. /predict)
"""
from fastapi import Header, HTTPException

from app.core.security import decode_access_token
from app.db.database import get_connection, get_user_by_id


def _extract_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_id(get_connection(), int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


async def get_current_user_optional(authorization: str | None = Header(default=None)) -> dict | None:
    token = _extract_token(authorization)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    return get_user_by_id(get_connection(), int(payload["sub"]))
