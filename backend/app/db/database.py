# database.py
import json
import os
from datetime import datetime, timezone
from typing import Any

import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()


def get_database_url() -> str:
    """Return the configured database URL, supporting either DATABASE_URL or SUPABASE_URL."""
    url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_URL")
    if not url:
        return "postgresql://postgres:password@localhost:5432/greennepal"

    if "sslmode=" not in url and "supabase.co" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}sslmode=require"
    return url


DATABASE_URL = get_database_url()

# Module-level connection pool — created once, reused across all requests
_pool: psycopg2.pool.ThreadedConnectionPool | None = None

CREATE_PREDICTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS predictions (
    id              SERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    filename        TEXT,
    content_type    TEXT,
    predicted_class TEXT,
    confidence      FLOAT,
    top3            JSONB,
    status          TEXT NOT NULL,
    error           TEXT,
    request_size    INTEGER NOT NULL
);
"""


def get_connection() -> psycopg2.pool.ThreadedConnectionPool:
    """
    Returns the shared connection pool.
    Creates it on first call (lazy init).
    """
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL,
        )
    return _pool



CREATE_RESULTS_TABLE = """
CREATE TABLE IF NOT EXISTS results (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    type            TEXT NOT NULL,
    name            TEXT NOT NULL,
    emoji           TEXT,
    points          INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

def init_db(pool: psycopg2.pool.ThreadedConnectionPool) -> None:
    """
    Creates the predictions table if it doesn't exist.
    Called once at app startup.
    """
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(CREATE_PREDICTIONS_TABLE)
            cur.execute(CREATE_RESULTS_TABLE)
        conn.commit()
    finally:
        pool.putconn(conn)


def log_prediction(
    pool: psycopg2.pool.ThreadedConnectionPool,
    filename: str,
    content_type: str,
    predicted_class: str | None,
    confidence: float | None,
    top3: list[dict[str, Any]] | None,
    status: str,
    error: str | None,
    request_size: int,
) -> int:
    """
    Saves a prediction result to the database.
    Returns the new row's id.
    """
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO predictions (
                    created_at, filename, content_type,
                    predicted_class, confidence, top3,
                    status, error, request_size
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    datetime.now(timezone.utc),
                    filename,
                    content_type,
                    predicted_class,
                    confidence,
                    json.dumps(top3 or []),  # stored as JSONB
                    status,
                    error,
                    request_size,
                ),
            )
            new_id = cur.fetchone()[0]
        conn.commit()
        return new_id
    finally:
        pool.putconn(conn)


def fetch_predictions(
    pool: psycopg2.pool.ThreadedConnectionPool,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    Returns a list of predictions, newest first.
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM predictions ORDER BY id DESC LIMIT %s OFFSET %s",
                (limit, offset),
            )
            rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        pool.putconn(conn)


def fetch_prediction(
    pool: psycopg2.pool.ThreadedConnectionPool,
    prediction_id: int,
) -> dict[str, Any] | None:
    """
    Returns a single prediction by id, or None if not found.
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM predictions WHERE id = %s",
                (prediction_id,),
            )
            row = cur.fetchone()
        return dict(row) if row else None
    finally:
        pool.putconn(conn)

def save_result(
    pool: psycopg2.pool.ThreadedConnectionPool,
    user_id: int,
    type: str,
    name: str,
    emoji: str,
    points: int,
) -> None:
    """
    Saves a scan result linked to a user.
    Powers the dashboard history and stats.
    """
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO results 
                    (user_id, type, name, emoji, points)
                VALUES 
                    (%s, %s, %s, %s, %s)
                """,
                (user_id, type, name, emoji, points),
            )
        conn.commit()
    finally:
        pool.putconn(conn)


def user_exists(pool: psycopg2.pool.ThreadedConnectionPool, user_id: int) -> bool:
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM users WHERE id = %s", (user_id,))
            return cur.fetchone() is not None
    finally:
        pool.putconn(conn)


def fetch_dashboard_stats(pool: psycopg2.pool.ThreadedConnectionPool, user_id: int) -> dict:
    """
    Returns everything DashboardPage.jsx needs in one call: aggregate stats,
    a breakdown by waste type (for the pie chart), and recent scan history.
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    COUNT(*) AS items_identified,
                    COALESCE(SUM(points), 0) AS total_points
                FROM results
                WHERE user_id = %s
                """,
                (user_id,),
            )
            totals = cur.fetchone()

            cur.execute(
                """
                SELECT type, COUNT(*) AS value
                FROM results
                WHERE user_id = %s
                GROUP BY type
                """,
                (user_id,),
            )
            type_counts = cur.fetchall()

            cur.execute(
                """
                SELECT type, name, emoji, points, created_at
                FROM results
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 10
                """,
                (user_id,),
            )
            history_rows = cur.fetchall()

        return {
            "items_identified": totals["items_identified"],
            "total_points": totals["total_points"],
            "type_counts": [dict(row) for row in type_counts],
            "history_rows": [dict(row) for row in history_rows],
        }
    finally:
        pool.putconn(conn)
