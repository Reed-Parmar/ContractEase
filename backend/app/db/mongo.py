"""
MongoDB connection manager using Motor (async driver).

Improvements:
- Uses production-safe Atlas TLS defaults
- Emits sanitized startup diagnostics about connection mode and retry settings
- Performs a small retry loop during startup ping to tolerate transient issues
- Uses a single shared AsyncIOMotorClient instance
"""

from __future__ import annotations

import logging
import time
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

from app.core.config import (
    MONGO_URI,
    DATABASE_NAME,
    MONGO_SERVER_SELECTION_TIMEOUT_MS,
    MONGO_CONNECT_TIMEOUT_MS,
    MONGO_SOCKET_TIMEOUT_MS,
    MONGO_MAX_POOL_SIZE,
    MONGO_MIN_POOL_SIZE,
    MONGO_MAX_IDLE_TIME_MS,
    MONGO_STARTUP_RETRY_COUNT,
    MONGO_STARTUP_RETRY_DELAY_MS,
)


logger = logging.getLogger(__name__)


def _build_client_options() -> dict[str, Any]:
    opts: dict[str, Any] = {
        "serverSelectionTimeoutMS": int(MONGO_SERVER_SELECTION_TIMEOUT_MS),
        "connectTimeoutMS": int(MONGO_CONNECT_TIMEOUT_MS),
        "socketTimeoutMS": int(MONGO_SOCKET_TIMEOUT_MS),
        "maxPoolSize": int(MONGO_MAX_POOL_SIZE),
        "minPoolSize": int(MONGO_MIN_POOL_SIZE),
        "maxIdleTimeMS": int(MONGO_MAX_IDLE_TIME_MS),
    }

    # Atlas and Render both expect TLS; keep the client on the secure default.
    opts["tls"] = True

    return opts


# Create a single shared AsyncIOMotorClient instance.
# Motor/pymongo will lazily connect; options above control behaviour.
_client_opts = _build_client_options()
logger.info(
    "Initializing Mongo client: mode=%s tls=%s serverSelectionTimeoutMS=%s connectTimeoutMS=%s socketTimeoutMS=%s maxPoolSize=%s minPoolSize=%s maxIdleTimeMS=%s",
    "SRV" if MONGO_URI.strip().lower().startswith("mongodb+srv:") else "STANDARD",
    _client_opts.get("tls", False),
    _client_opts["serverSelectionTimeoutMS"],
    _client_opts["connectTimeoutMS"],
    _client_opts["socketTimeoutMS"],
    _client_opts["maxPoolSize"],
    _client_opts["minPoolSize"],
    _client_opts["maxIdleTimeMS"],
)
client = AsyncIOMotorClient(MONGO_URI, **_client_opts)

# Database handle
db = client[DATABASE_NAME]


async def close_mongo_connection() -> None:
    """Gracefully close the Motor client (call on app shutdown)."""
    client.close()


async def ensure_mongo_ready() -> None:
    """Ping MongoDB during startup to fail fast with actionable logs.

    Retries a small number of times to tolerate transient network/TLS glitches.
    Detailed diagnostics are logged to help root-cause Atlas connectivity issues.
    """
    attempt = 0
    last_exc: Exception | None = None
    is_srv = MONGO_URI.strip().lower().startswith("mongodb+srv:")

    logger.info(
        "Mongo startup: env=MONGO_URI present mode=%s database=%s retryCount=%s retryDelayMs=%s",
        "SRV" if is_srv else "STANDARD",
        DATABASE_NAME,
        MONGO_STARTUP_RETRY_COUNT,
        MONGO_STARTUP_RETRY_DELAY_MS,
    )
    logger.info(
        "Mongo timeouts: serverSelectionTimeoutMS=%s connectTimeoutMS=%s socketTimeoutMS=%s maxPoolSize=%s minPoolSize=%s maxIdleTimeMS=%s",
        MONGO_SERVER_SELECTION_TIMEOUT_MS,
        MONGO_CONNECT_TIMEOUT_MS,
        MONGO_SOCKET_TIMEOUT_MS,
        MONGO_MAX_POOL_SIZE,
        MONGO_MIN_POOL_SIZE,
        MONGO_MAX_IDLE_TIME_MS,
    )

    # Try ping with limited retries
    for attempt in range(1, max(1, int(MONGO_STARTUP_RETRY_COUNT)) + 1):
        try:
            logger.info("Pinging MongoDB (attempt %d/%d)", attempt, MONGO_STARTUP_RETRY_COUNT)
            # Trigger server selection and handshake
            await client.admin.command("ping")

            logger.info("MongoDB connection established successfully")
            return
        except ServerSelectionTimeoutError as sse:
            last_exc = sse
            logger.warning("MongoDB server selection timed out (attempt %d/%d)", attempt, MONGO_STARTUP_RETRY_COUNT)
        except Exception as exc:
            last_exc = exc
            logger.exception("MongoDB ping failed (attempt %d/%d)", attempt, MONGO_STARTUP_RETRY_COUNT)

        if attempt < MONGO_STARTUP_RETRY_COUNT:
            delay = int(MONGO_STARTUP_RETRY_DELAY_MS) / 1000.0
            logger.info("Retrying MongoDB ping after %.2fs...", delay)
            time.sleep(delay)

    # If we get here, all attempts failed — raise to surface startup failure
    logger.error("MongoDB unavailable after %d attempts", MONGO_STARTUP_RETRY_COUNT)
    if last_exc:
        raise last_exc
    raise RuntimeError("MongoDB ping failed during startup")


# ── Collection handles ────────────────────────────────────────
users_collection = db["users"]
clients_collection = db["clients"]
contracts_collection = db["contracts"]
signatures_collection = db["signatures"]
