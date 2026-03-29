"""
Shared pytest fixtures for skeleton-lambda-worker tests.
"""

import json
import os
from unittest.mock import MagicMock

import pytest


# Environment - must be set BEFORE service modules are imported.
os.environ.setdefault("POWERTOOLS_SERVICE_NAME", "skeleton-lambda-worker-test")
os.environ.setdefault("SERVICE_VERSION", "0.0.0-test")
os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("CORS_ALLOW_ORIGIN", "*")
os.environ.setdefault("POWERTOOLS_TRACE_DISABLED", "true")
os.environ.setdefault("POWERTOOLS_METRICS_DISABLED", "true")


@pytest.fixture()
def lambda_context() -> MagicMock:
    """Minimal Lambda context mock."""
    ctx = MagicMock()
    ctx.function_name = "skeleton-lambda-worker-test"
    ctx.memory_limit_in_mb = 128
    ctx.invoked_function_arn = (
        "arn:aws:lambda:us-east-1:123456789012:function:skeleton-lambda-worker-test"
    )
    ctx.aws_request_id = "test-request-id"
    ctx.get_remaining_time_in_millis.return_value = 30_000
    return ctx


def _sqs_record(body: dict, message_id: str = "msg-001") -> dict:
    """Build a minimal SQS record dict."""
    return {
        "messageId": message_id,
        "receiptHandle": "AQEBwJnKyrHigUMZj6reyAsAg==",
        "body": json.dumps(body),
        "attributes": {
            "ApproximateReceiveCount": "1",
            "SentTimestamp": "1545082650636",
            "SenderId": "AIDAIENQZJOLO23YVJ4VO",
            "ApproximateFirstReceiveTimestamp": "1545082650649",
        },
        "messageAttributes": {},
        "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
        "eventSource": "aws:sqs",
        "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:skeleton-worker-queue",
        "awsRegion": "us-east-1",
    }


@pytest.fixture()
def sqs_event() -> dict:
    """Minimal SQS event with one record."""
    return {"Records": [_sqs_record({"task": "example", "value": 42})]}


@pytest.fixture()
def sqs_event_multi_record() -> dict:
    """SQS event with multiple records for batch testing."""
    return {
        "Records": [
            _sqs_record({"task": "first", "value": 1}, "msg-001"),
            _sqs_record({"task": "second", "value": 2}, "msg-002"),
        ]
    }
