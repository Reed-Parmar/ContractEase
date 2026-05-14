"""Core PDF generation service for finalized contracts.

The service is intentionally framework-agnostic so route handlers can import
and reuse it without coupling PDF logic to FastAPI endpoints.
"""

from __future__ import annotations

import importlib.metadata
import logging
from typing import Any, Literal, Mapping

from ..config import PDF_STYLE_PATH
from ..utils.pdf_utils import (
    build_contract_template_context,
    build_pdf_output_path,
    ensure_pdf_storage_dir,
    render_contract_template,
)

PdfOutputMode = Literal["path", "bytes"]
logger = logging.getLogger(__name__)


def _safe_package_version(package_name: str) -> str:
    try:
        return importlib.metadata.version(package_name)
    except Exception:
        return "unknown"


def _log_pdf_dependency_diagnostics() -> None:
    logger.info(
        "PDF dependency diagnostics: weasyprint=%s pydyf=%s tinycss2=%s cssselect2=%s pyphen=%s fonttools=%s",
        _safe_package_version("weasyprint"),
        _safe_package_version("pydyf"),
        _safe_package_version("tinycss2"),
        _safe_package_version("cssselect2"),
        _safe_package_version("pyphen"),
        _safe_package_version("fonttools"),
    )


def generate_contract_pdf(
    contract_data: Mapping[str, Any],
    output_mode: PdfOutputMode = "path",
) -> str | bytes:
    """Generate a contract PDF from dictionary payload data.

    Args:
        contract_data: Contract fields used in template rendering.
        output_mode: "path" to save and return file path, "bytes" to return binary.

    Returns:
        A string file path when output_mode is "path", otherwise PDF bytes.
    """
    contract_type = str(contract_data.get("type") or "").strip().lower()
    context = build_contract_template_context(contract_data)
    template_map = {
        "house_sale": "house_sale.html",
        "website_development": "website_development.html",
        "broker": "broker.html",
        "nda": "nda.html",
        "employment": "employment.html",
    }
    template_name = template_map.get(contract_type)
    rendered_html = render_contract_template(context, template_name=template_name)
    logger.info(
        "PDF generation started: contract_type=%s output_mode=%s",
        contract_type or "unknown",
        output_mode,
    )
    _log_pdf_dependency_diagnostics()

    try:
        from weasyprint import CSS, HTML
    except Exception as error:  # pragma: no cover - depends on host OS libs
        raise RuntimeError(
            "WeasyPrint is installed but native libraries are missing. "
            "Install GTK/Pango/Cairo runtime dependencies for this OS before generating PDFs."
        ) from error

    stylesheets = [CSS(filename=str(PDF_STYLE_PATH))]
    html = HTML(string=rendered_html, base_url=str(PDF_STYLE_PATH.parent))

    if output_mode == "bytes":
        try:
            pdf_bytes = html.write_pdf(stylesheets=stylesheets)
        except TypeError as error:
            logger.exception("PDF generation failed while writing bytes")
            raise RuntimeError(
                "WeasyPrint PDF generation failed. Check that pydyf is pinned to a compatible version."
            ) from error
        logger.info("PDF generation completed: contract_type=%s output_mode=bytes", contract_type or "unknown")
        return pdf_bytes

    output_dir = ensure_pdf_storage_dir()
    output_path = build_pdf_output_path(contract_data, output_dir)
    try:
        html.write_pdf(target=str(output_path), stylesheets=stylesheets)
    except TypeError as error:
        logger.exception("PDF generation failed while writing to path %s", output_path)
        raise RuntimeError(
            "WeasyPrint PDF generation failed. Check that pydyf is pinned to a compatible version."
        ) from error
    logger.info("PDF generation completed: contract_type=%s output_mode=path output_path=%s", contract_type or "unknown", output_path)
    return str(output_path)
