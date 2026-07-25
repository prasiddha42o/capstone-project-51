# app/cli.py
"""
Admin/management commands, run as one-off processes against the same
codebase and config as the app itself (12-Factor Factor XII).

Usage:
    python -m app.cli init-db
"""
import argparse
import logging
import sys

from app.core.config import settings
from app.db.database import get_connection, init_db

logging.basicConfig(level=settings.LOG_LEVEL, format="%(levelname)s %(name)s: %(message)s", stream=sys.stdout)
logger = logging.getLogger("waste_api.cli")


def cmd_init_db() -> None:
    init_db(get_connection())
    logger.info("Database schema is up to date (users, predictions, results).")


def main() -> None:
    parser = argparse.ArgumentParser(description="Admin commands for the Waste Classification API")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("init-db", help="Create tables if they don't already exist")

    args = parser.parse_args()
    if args.command == "init-db":
        cmd_init_db()


if __name__ == "__main__":
    main()
