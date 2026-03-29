"""
Skeleton Worker Lambda handler

Triggered by SQS. Each invocation receives a batch of records defined by
the event source mapping's batch size.
"""

from typing import Any

from aws_lambda_powertools.utilities.batch import (
    BatchProcessor,
    EventType,
    process_partial_response,
)
from aws_lambda_powertools.utilities.batch.types import PartialItemFailureResponse
from aws_lambda_powertools.utilities.typing import LambdaContext

from shared_core.observability import build_logger, build_tracer
from skeleton_lambda_worker.config import get_settings
from skeleton_lambda_worker.service.job_service import process_record

settings = get_settings()
logger = build_logger(settings)
tracer = build_tracer(settings)

processor = BatchProcessor(
    event_type=EventType.SQS, raise_on_entire_batch_failure=False
)


@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler
def handler(
    event: dict[str, Any], context: LambdaContext
) -> PartialItemFailureResponse:
    """
    Lambda entry-point.

    Uses Powertools BatchProcessor so individual record failures are reported
    back to SQS as partial-batch failures instead of retrying the whole batch.
    """
    return process_partial_response(
        event=event,
        record_handler=process_record,
        processor=processor,
        context=context,
    )
