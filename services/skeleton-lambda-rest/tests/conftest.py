"""
Shared pytest fixtures for skeleton-lambda-rest tests.
"""

import json
import os
from unittest.mock import MagicMock

import pytest


# Environment - must be set BEFORE the service modules are imported so that
os.environ.setdefault("POWERTOOLS_SERVICE_NAME", "skeleton-lambda-rest-test")
os.environ.setdefault("SERVICE_VERSION", "0.0.0-test")
os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("CORS_ALLOW_ORIGIN", "*")
# Disable X-Ray tracing in unit tests
os.environ.setdefault("POWERTOOLS_TRACE_DISABLED", "true")
os.environ.setdefault("POWERTOOLS_METRICS_DISABLED", "true")


@pytest.fixture()
def lambda_context() -> MagicMock:
    """Minimal Lambda context mock."""
    ctx = MagicMock()
    ctx.function_name = "skeleton-lambda-rest-test"
    ctx.memory_limit_in_mb = 128
    ctx.invoked_function_arn = (
        "arn:aws:lambda:us-east-1:123456789012:function:skeleton-lambda-rest-test"
    )
    ctx.aws_request_id = "test-request-id"
    ctx.get_remaining_time_in_millis.return_value = 30_000
    return ctx


def _api_gw_event(
    method: str = "GET",
    path: str = "/api/v1/skeleton/health",
    headers: dict | None = None,
    body: dict | None = None,
    claims: dict | None = None,
    identity: dict | None = None,
) -> dict:
    """Build a minimal API Gateway REST proxy event."""
    return {
        "resource": path,
        "path": path,
        "httpMethod": method,
        "headers": headers or {"content-type": "application/json"},
        "multiValueHeaders": {},
        "queryStringParameters": None,
        "multiValueQueryStringParameters": None,
        "pathParameters": None,
        "stageVariables": None,
        "requestContext": {
            "requestId": "test-req-id",
            "resourcePath": path,
            "httpMethod": method,
            "path": path,
            "stage": "$default",
            "authorizer": {"claims": claims} if claims is not None else {},
            "identity": identity
            or {
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
        },
        "body": json.dumps(body) if body else None,
        "isBase64Encoded": False,
    }


@pytest.fixture()
def health_event() -> dict:
    """API Gateway event for GET /api/v1/skeleton/health."""
    return _api_gw_event("GET", "/api/v1/skeleton/health")


@pytest.fixture()
def me_event() -> dict:
    """Protected API Gateway event for GET /api/v1/skeleton/me."""
    return _api_gw_event(
        "GET",
        "/api/v1/skeleton/me",
        claims={
            "sub": "user-123",
            "cognito:username": "jane.doe",
            "email": "jane@example.com",
        },
    )


@pytest.fixture()
def me_event_unauthenticated() -> dict:
    """Unauthenticated API Gateway event for GET /api/v1/skeleton/me."""
    return _api_gw_event("GET", "/api/v1/skeleton/me")


@pytest.fixture()
def admin_event() -> dict:
    """Admin API Gateway event for GET /api/v1/skeleton/admin."""
    return _api_gw_event(
        "GET",
        "/api/v1/skeleton/admin",
        claims={
            "sub": "admin-123",
            "cognito:username": "admin.user",
            "email": "admin@example.com",
            "cognito:groups": ["admin"],
        },
    )


@pytest.fixture()
def admin_event_non_admin() -> dict:
    """Non-admin API Gateway event for GET /api/v1/skeleton/admin."""
    return _api_gw_event(
        "GET",
        "/api/v1/skeleton/admin",
        claims={
            "sub": "user-123",
            "cognito:username": "jane.doe",
            "email": "jane@example.com",
            "cognito:groups": ["viewer"],
        },
    )


@pytest.fixture()
def private_event() -> dict:
    """IAM-protected API Gateway event for GET /api/v1/skeleton/private."""
    return _api_gw_event(
        "GET",
        "/api/v1/skeleton/private",
        identity={
            "sourceIp": "127.0.0.1",
            "userArn": "arn:aws:iam::123456789012:role/saas-template-dev-worker",
            "user": "AROAXAMPLE:worker",
            "caller": "AROAXAMPLE:worker",
            "accessKey": "ASIAXAMPLE",
        },
    )


@pytest.fixture()
def private_event_unauthenticated() -> dict:
    """Unsigned API Gateway event for GET /api/v1/skeleton/private."""
    return _api_gw_event(
        "GET",
        "/api/v1/skeleton/private",
        identity={
            "sourceIp": "127.0.0.1",
            "userAgent": "pytest",
        },
    )
