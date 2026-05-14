"""Simple storage service for uploading generated PDFs to Cloudinary.

Provides a small, focused API used by PDF and contract services. Uploads are
performed as `resource_type='raw'` and stored under a configurable folder.
"""
from __future__ import annotations

import io
import logging
import time
from typing import Optional

import cloudinary.uploader

from app.core.cloudinary_client import configure_cloudinary
from app.core.config import CLOUDINARY_PDF_FOLDER

logger = logging.getLogger(__name__)


def _ensure_configured() -> None:
    configure_cloudinary()


def upload_pdf_bytes(
    pdf_bytes: bytes,
    public_id: Optional[str] = None,
    folder: Optional[str] = None,
) -> dict:
    """Upload raw PDF bytes to Cloudinary as a raw resource.

    Returns the raw response from Cloudinary on success. Raises on failure.
    """
    _ensure_configured()

    folder = folder or CLOUDINARY_PDF_FOLDER or "contractease/pdfs"
    timestamp = int(time.time())
    final_public_id = public_id or f"pdf_{timestamp}"

    try:
        file_obj = io.BytesIO(pdf_bytes)
        # Cloudinary accepts file-like objects; use resource_type='raw' for PDFs
        result = cloudinary.uploader.upload(
            file_obj,
            resource_type="raw",
            folder=folder,
            public_id=final_public_id,
            use_filename=False,
            unique_filename=True,
            overwrite=False,
        )
        logger.info("Uploaded PDF to Cloudinary: %s/%s", folder, final_public_id)
        return result
    except Exception as exc:  # pragma: no cover - external dependency
        logger.exception("Cloudinary upload failed: %s", exc)
        raise
