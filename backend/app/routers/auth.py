# auth.py
import re
from datetime import datetime, timezone
from typing import Any

import bcrypt
import psycopg2.errors
import psycopg2.pool
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.database import get_connection

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# At least 8 chars, at least one uppercase letter, at least one digit
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Z])(?=.*\d).{8,}$")


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def get_user_by_email(pool, email: str) -> dict | None:
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM users WHERE email = %s",
                (email.lower().strip(),),
            )
            row = cur.fetchone()
            if row is None:
                return None
            cols = [desc[0] for desc in cur.description]
            return dict(zip(cols, row))
    finally:
        pool.putconn(conn)


def create_user(pool, username: str, email: str, password_hash: str) -> dict:
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email, created_at
                """,
                (username, email, password_hash),
            )
            row = cur.fetchone()
            cols = [desc[0] for desc in cur.description]
            result = dict(zip(cols, row))
        conn.commit()
        return result
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="That username is already taken")
    finally:
        pool.putconn(conn)


@router.post("/register")
async def register(body: RegisterRequest) -> dict:
    pool = get_connection()

    name = body.name.strip()
    email = body.email.strip().lower()
    password = body.password

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="Name, email and password are required")

    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")

    if not PASSWORD_PATTERN.match(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include an uppercase letter and a number",
        )

    existing = get_user_by_email(pool, email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = create_user(pool, name, email, password_hash)

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["username"],
            "email": user["email"],
        },
    }


@router.post("/login")
async def login(body: LoginRequest) -> dict:
    pool = get_connection()

    email = body.email.strip().lower()
    password = body.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = get_user_by_email(pool, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    is_match = bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8"))
    if not is_match:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["username"],
            "email": user["email"],
        },
    }
