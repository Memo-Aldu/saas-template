"""
Response utilities
"""

import json
from http import HTTPStatus

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.content_types import APPLICATION_JSON


def json_response(
    body: dict,
    status_code: HTTPStatus = HTTPStatus.OK,
    headers: dict[str, str] | None = None,
) -> Response:
    """
    Return a JSON response
    Args:
        body (dict): Response body
        status_code (int, optional): HTTP status code. Defaults to 200.
        headers (dict[str, str] | None, optional): HTTP headers. Defaults to None.
    Returns:
        Response: JSON response
    """
    return Response(
        status_code=status_code,
        content_type=APPLICATION_JSON,
        body=json.dumps(body),
        headers=headers or {},
    )
