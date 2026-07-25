# tests/conftest.py
"""
app.core.config.Settings requires DATABASE_URL and JWT_SECRET_KEY to be set
(that's the point -- fail fast if they're missing in real usage). For tests
that don't touch a real database, set harmless placeholder values before
anything under app/ gets imported.
"""
import os

os.environ.setdefault("DATABASE_URL", "postgresql://postgres:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret")
os.environ.setdefault("APP_ENV", "development")
