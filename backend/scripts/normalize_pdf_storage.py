"""Audit and normalize contract PDF storage fields.

This script keeps Cloudinary URLs as the source of truth while preserving the
existing MongoDB collection structure. It reports legacy `pdf_path` usage,
missing PDF metadata, and can mirror HTTP URLs into `pdf_url` for records that
already have a valid remote PDF.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from app.db.mongo import contracts_collection, ensure_mongo_ready

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("normalize_pdf_storage")


def _is_http_url(value: Any) -> bool:
    return isinstance(value, str) and value.strip().lower().startswith(("http://", "https://"))


def _normalize_counts(doc: dict[str, Any]) -> dict[str, bool]:
    pdf_url = doc.get("pdf_url")
    pdf_path = doc.get("pdf_path")
    return {
        "has_pdf_url": _is_http_url(pdf_url),
        "has_http_pdf_path": _is_http_url(pdf_path),
        "has_local_pdf_path": isinstance(pdf_path, str) and bool(pdf_path.strip()) and not _is_http_url(pdf_path),
        "missing_both": not _is_http_url(pdf_url) and not isinstance(pdf_path, str),
    }


async def audit_contracts() -> dict[str, int]:
    counts = {
        "total": 0,
        "pdf_url": 0,
        "http_pdf_path": 0,
        "local_pdf_path": 0,
        "missing_both": 0,
    }

    cursor = contracts_collection.find({}, {"pdf_url": 1, "pdf_path": 1})
    async for doc in cursor:
        counts["total"] += 1
        flags = _normalize_counts(doc)
        if flags["has_pdf_url"]:
            counts["pdf_url"] += 1
        if flags["has_http_pdf_path"]:
            counts["http_pdf_path"] += 1
        if flags["has_local_pdf_path"]:
            counts["local_pdf_path"] += 1
        if flags["missing_both"]:
            counts["missing_both"] += 1

    return counts


async def normalize_contracts(apply_changes: bool) -> dict[str, int]:
    counts = {
        "updated_pdf_url": 0,
        "mirrored_pdf_path": 0,
        "cleared_local_pdf_path": 0,
        "skipped_local_paths": 0,
    }

    cursor = contracts_collection.find({}, {"pdf_url": 1, "pdf_path": 1})
    async for doc in cursor:
        pdf_url = doc.get("pdf_url")
        pdf_path = doc.get("pdf_path")
        update_fields: dict[str, Any] = {}

        if _is_http_url(pdf_url):
            if pdf_path != pdf_url:
                update_fields["pdf_path"] = pdf_url
                counts["mirrored_pdf_path"] += 1
        elif _is_http_url(pdf_path):
            update_fields["pdf_url"] = pdf_path
            update_fields["pdf_path"] = pdf_path
            counts["updated_pdf_url"] += 1
        elif isinstance(pdf_path, str) and pdf_path.strip():
            update_fields["pdf_path"] = None
            counts["cleared_local_pdf_path"] += 1
            counts["skipped_local_paths"] += 1

        if apply_changes and update_fields:
            await contracts_collection.update_one({"_id": doc["_id"]}, {"$set": update_fields})

    return counts


async def main() -> None:
    parser = argparse.ArgumentParser(description="Audit and normalize contract PDF storage fields")
    parser.add_argument("--apply", action="store_true", help="Apply safe normalization updates")
    args = parser.parse_args()

    await ensure_mongo_ready()
    audit_counts = await audit_contracts()
    logger.info("PDF storage audit: %s", audit_counts)

    if args.apply:
        update_counts = await normalize_contracts(apply_changes=True)
        logger.info("PDF storage normalization: %s", update_counts)
    else:
        logger.info("Dry run only. Re-run with --apply to mirror valid Cloudinary URLs into pdf_url/pdf_path.")


if __name__ == "__main__":
    asyncio.run(main())