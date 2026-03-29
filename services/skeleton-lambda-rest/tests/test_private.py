"""
Unit tests for the IAM-protected private API route.
"""

import json

from skeleton_lambda_rest.handler import handler


def test_private_returns_iam_identity(private_event, lambda_context):
    """GET /api/v1/skeleton/private should return the IAM caller details."""
    response = handler(private_event, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert body["data"]["user_arn"] == (
        "arn:aws:iam::123456789012:role/saas-template-dev-worker"
    )
    assert body["data"]["caller"] == "AROAXAMPLE:worker"


def test_private_requires_iam_identity(private_event_unauthenticated, lambda_context):
    """GET /api/v1/skeleton/private should reject unsigned requests."""
    response = handler(private_event_unauthenticated, lambda_context)
    body = json.loads(response["body"])

    assert response["statusCode"] == 401
    assert body["code"] == "unauthorized"
