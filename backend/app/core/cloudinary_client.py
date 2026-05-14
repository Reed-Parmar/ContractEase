"""Cloudinary client initialization.

Central place to configure the Cloudinary SDK from environment variables
exposed via `app.core.config`.
"""
from __future__ import annotations

import logging
from typing import Any

import cloudinary

from .config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_URL,
)

logger = logging.getLogger(__name__)


def configure_cloudinary() -> None:
    """Apply Cloudinary configuration if available.

    This is idempotent and safe to call during app startup. If no Cloudinary
    configuration is present, the SDK remains unconfigured and upload calls
    will fail with informative errors.
    """
    config_values: dict[str, Any] = {}
    if CLOUDINARY_URL:
        config_values["cloudinary_url"] = CLOUDINARY_URL
    else:
        if CLOUDINARY_CLOUD_NAME:
            config_values["cloud_name"] = CLOUDINARY_CLOUD_NAME
        if CLOUDINARY_API_KEY:
            config_values["api_key"] = CLOUDINARY_API_KEY
        if CLOUDINARY_API_SECRET:
            config_values["api_secret"] = CLOUDINARY_API_SECRET

    if not config_values:
        logger.debug("No Cloudinary configuration found; skipping configuration")
        return

    try:
        cloudinary.config(**config_values)
        logger.info("Cloudinary configured: cloud_name=%s", CLOUDINARY_CLOUD_NAME or "(from URL)")
    except Exception as exc:  # pragma: no cover - environment dependent
        logger.exception("Failed to configure Cloudinary: %s", exc)
