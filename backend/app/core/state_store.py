"""Small durable JSON state store for demo features that do not have full ORM tables yet."""
import json
from typing import Any, Optional

from sqlalchemy import text

from app.core.database import engine


def read_state(key: str) -> Optional[Any]:
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE IF NOT EXISTS app_state (key VARCHAR(120) PRIMARY KEY, payload TEXT NOT NULL)"))
        row = connection.execute(text("SELECT payload FROM app_state WHERE key = :key"), {"key": key}).first()
    return json.loads(row[0]) if row else None


def write_state(key: str, value: Any) -> None:
    payload = json.dumps(value, ensure_ascii=False)
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE IF NOT EXISTS app_state (key VARCHAR(120) PRIMARY KEY, payload TEXT NOT NULL)"))
        connection.execute(
            text("INSERT INTO app_state (key, payload) VALUES (:key, :payload) ON CONFLICT (key) DO UPDATE SET payload = :payload"),
            {"key": key, "payload": payload},
        )
