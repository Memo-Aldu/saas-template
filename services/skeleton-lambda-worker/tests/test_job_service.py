"""
Unit tests for the SQS worker handler and job service.
"""

import json
from unittest.mock import MagicMock, patch

import pytest

from skeleton_lambda_worker.handler import handler
from skeleton_lambda_worker.service.job_service import process_record


# job_service.process_record
def _make_sqs_record(body: dict, message_id: str = "msg-test") -> MagicMock:
    """Create a mock SQS record compatible with process_record."""
    record = MagicMock()
    record.message_id = message_id
    record.body = json.dumps(body)
    return record


def test_process_record_logs_message_id() -> None:
    """process_record should log the message_id without raising."""
    record = _make_sqs_record({"task": "test", "value": 1})

    with patch("skeleton_lambda_worker.service.job_service.logger") as mock_logger:
        process_record(record)
        mock_logger.info.assert_called_once()
        call_kwargs = mock_logger.info.call_args
        assert call_kwargs.kwargs.get("extra", {}).get("message_id") == "msg-test"


def test_process_record_parses_body() -> None:
    """process_record should successfully JSON-parse the body."""
    body = {"task": "parse_test", "items": [1, 2, 3]}
    record = _make_sqs_record(body)

    process_record(record)


def test_process_record_invalid_json_raises() -> None:
    """process_record should raise on malformed JSON body."""
    record = MagicMock()
    record.message_id = "msg-bad-json"
    record.body = "not-valid-json{"

    with pytest.raises(Exception):
        process_record(record)


# handler - full Lambda invocation via SQS batch processor
def test_handler_processes_single_record(sqs_event, lambda_context) -> None:
    """handler() should process a single-record SQS event and return a response."""
    response = handler(sqs_event, lambda_context)

    assert "batchItemFailures" in response
    assert response["batchItemFailures"] == []


def test_handler_processes_multi_record_batch(sqs_event_multi_record, lambda_context) -> None:
    """handler() should handle a multi-record batch without failures."""
    response = handler(sqs_event_multi_record, lambda_context)

    assert "batchItemFailures" in response
    assert response["batchItemFailures"] == []


def test_handler_reports_partial_failure(lambda_context) -> None:
    """handler() should report failed records as batchItemFailures."""
    bad_event = {
        "Records": [
            {
                "messageId": "bad-msg",
                "receiptHandle": "handle",
                "body": "not-valid-json{",
                "attributes": {
                    "ApproximateReceiveCount": "1",
                    "SentTimestamp": "1545082650636",
                    "SenderId": "AIDAIENQZJOLO23YVJ4VO",
                    "ApproximateFirstReceiveTimestamp": "1545082650649",
                },
                "messageAttributes": {},
                "md5OfBody": "abc",
                "eventSource": "aws:sqs",
                "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:queue",
                "awsRegion": "us-east-1",
            }
        ]
    }

    response = handler(bad_event, lambda_context)

    assert "batchItemFailures" in response
    failures = response["batchItemFailures"]
    assert len(failures) == 1
    assert failures[0]["itemIdentifier"] == "bad-msg"
