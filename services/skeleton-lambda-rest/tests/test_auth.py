"""
Unit tests for authenticated and admin API routes.
"""

import json

from skeleton_lambda_rest.handler import handler


def test_me_returns_authenticated_user(me_event, lambda_context):
    """GET /api/v1/skeleton/me should return the current Cognito principal."""
    response = handler(me_event, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["data"]["subject"] == "user-123"
    assert body["data"]["username"] == "jane.doe"


def test_me_requires_authentication(me_event_unauthenticated, lambda_context):
    """GET /api/v1/skeleton/me should reject unauthenticated requests."""
    response = handler(me_event_unauthenticated, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 401
    assert body["code"] == "unauthorized"


def test_admin_returns_success_for_admin_group(admin_event, lambda_context):
    """GET /api/v1/skeleton/admin should allow Cognito admins."""
    response = handler(admin_event, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["data"]["role"] == "admin"


def test_admin_returns_forbidden_for_non_admin(admin_event_non_admin, lambda_context):
    """GET /api/v1/skeleton/admin should reject non-admin users."""
    response = handler(admin_event_non_admin, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 403
    assert body["code"] == "forbidden"
