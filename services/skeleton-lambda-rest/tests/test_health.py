"""
Unit tests for the /api/v1/skeleton/health endpoint.
"""

import json

from skeleton_lambda_rest.handler import handler


def test_health_returns_200(health_event, lambda_context):
    """GET /api/v1/skeleton/health should return HTTP 200."""
    # Import here so env vars from conftest are already set

    response = handler(health_event, lambda_context)

    assert response["statusCode"] == 200


def test_health_body_has_message(health_event, lambda_context):
    """GET /api/v1/skeleton/health body must contain message == 'OK'."""
    response = handler(health_event, lambda_context)
    body = json.loads(response["body"])

    assert body.get("message") == "OK"


def test_health_body_contains_version(health_event, lambda_context):
    """GET /api/v1/skeleton/health data block must contain version, service, environment."""
    response = handler(health_event, lambda_context)
    body = json.loads(response["body"])

    data = body.get("data", {})
    assert "version" in data
    assert "service" in data
    assert "environment" in data


def test_health_cors_headers(health_event, lambda_context):
    """GET /api/v1/skeleton/health response must include CORS Allow-Origin header."""
    response = handler(health_event, lambda_context)
    headers = response.get("headers", {})
    multi_value_headers = response.get("multiValueHeaders", {})

    assert (
        "Access-Control-Allow-Origin" in headers
        or "Access-Control-Allow-Origin" in multi_value_headers
    )


def test_health_environment_is_local(health_event, lambda_context):
    """In test env the environment field should be 'local'."""
    response = handler(health_event, lambda_context)
    body = json.loads(response["body"])

    assert body["data"]["environment"] == "local"
