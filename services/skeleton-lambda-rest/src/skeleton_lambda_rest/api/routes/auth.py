"""
Authenticated route examples.
"""

from http import HTTPStatus
from typing import Any

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.router import APIGatewayRouter

from domain_models.api import SuccessResponse
from shared_core.auth import (
    normalize_groups,
    requires_authenticated,
    requires_group,
    requires_iam_identity,
)
from shared_core.cors import cors_headers
from shared_core.responses import json_response
from skeleton_lambda_rest.config import get_settings

settings = get_settings()
router = APIGatewayRouter()


def _cors() -> dict[str, str]:
    return cors_headers(
        settings.cors_allow_origin,
        settings.cors_allow_headers,
        settings.cors_allow_methods,
    )


@router.get("/skeleton/me")
@requires_authenticated(router)
def get_current_user(*, auth_claims: dict[str, Any]) -> Response:
    """Return a small identity payload for the authenticated caller."""
    return json_response(
        SuccessResponse(
            message="Authenticated user loaded.",
            data={
                "subject": auth_claims.get("sub"),
                "username": auth_claims.get(
                    "cognito:username", auth_claims.get("username")
                ),
                "email": auth_claims.get("email"),
                "groups": normalize_groups(auth_claims.get("cognito:groups")),
            },
        ).model_dump(),
        status_code=HTTPStatus.OK,
        headers=_cors(),
    )


@router.get("/skeleton/admin")
@requires_group(router, "admin")
def get_admin_status(*, auth_claims: dict[str, Any]) -> Response:
    """Example admin-only endpoint backed by a Cognito group check."""
    return json_response(
        SuccessResponse(
            message="Admin access granted.",
            data={
                "subject": auth_claims.get("sub"),
                "username": auth_claims.get(
                    "cognito:username", auth_claims.get("username")
                ),
                "role": "admin",
            },
        ).model_dump(),
        status_code=HTTPStatus.OK,
        headers=_cors(),
    )


@router.get("/skeleton/private")
@requires_iam_identity(router)
def get_private_status(*, iam_identity: dict[str, Any]) -> Response:
    """Example IAM-protected endpoint for service-to-service access."""
    return json_response(
        SuccessResponse(
            message="IAM access granted.",
            data=iam_identity,
        ).model_dump(),
        status_code=HTTPStatus.OK,
        headers=_cors(),
    )
