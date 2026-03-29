"""
API error handling
"""

from aws_lambda_powertools.event_handler import Response

from shared_core.exceptions import AppError
from shared_core.responses import json_response


def _normalize_error_details(details: object) -> list[dict[str, str | None]] | None:
    """Convert application error details into the canonical error envelope shape."""
    if details is None:
        return None

    if isinstance(details, list):
        return details

    if isinstance(details, dict):
        return [
            {
                "field": str(field),
                "reason": str(reason),
            }
            for field, reason in details.items()
        ]

    return [{"field": None, "reason": str(details)}]


def map_exception_to_response(exc: Exception) -> Response:
    """
    Map an exception to a response
    Args:
        exc (Exception): Exception
    Returns:
        Response: Response
    """
    if isinstance(exc, AppError):
        return json_response(
            {
                "code": exc.code,
                "message": exc.message,
                "details": _normalize_error_details(exc.details),
            },
            status_code=exc.status_code,
        )

    return json_response(
        {
            "code": "internal_server_error",
            "message": "An unexpected error occurred.",
        },
        status_code=500,
    )
