# tests/test_config.py
"""
Verifies the 12-Factor fail-fast behavior: the app must refuse to start
(raise immediately on import) if required config is missing, rather than
silently running with a broken or insecure default.

Run in a subprocess with a clean environment so it isn't affected by
conftest.py's placeholder values or the developer's own .env/.bashrc.
"""
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _run_with_env(env: dict) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-c", "from app.core.config import settings; print('OK')"],
        cwd=PROJECT_ROOT,
        env=env,
        capture_output=True,
        text=True,
    )


def test_missing_required_vars_fails_fast():
    result = _run_with_env(env={"PATH": "/usr/bin:/bin"})
    assert result.returncode != 0
    assert "DATABASE_URL" in result.stderr
    assert "JWT_SECRET_KEY" in result.stderr


def test_with_required_vars_starts_cleanly():
    result = _run_with_env(env={
        "PATH": "/usr/bin:/bin",
        "DATABASE_URL": "postgresql://postgres:pw@localhost:5432/db",
        "JWT_SECRET_KEY": "some-secret",
    })
    assert result.returncode == 0
    assert "OK" in result.stdout
