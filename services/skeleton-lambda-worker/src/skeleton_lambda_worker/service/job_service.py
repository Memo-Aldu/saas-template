"""
Job service - core business logic for processing a single SQS record.

Replace the stub below with your actual domain logic.
"""

import json

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord

logger = Logger(child=True)


def process_record(record: SQSRecord) -> None:
    """
    Process a single SQS record.

    Args:
        record: A validated SQS record from Powertools BatchProcessor.

    Raises:
        AppError: on known domain errors (will be treated as a partial failure).
        Exception: any unhandled exception is re-raised and counted as a failure.
    """
    body = json.loads(record.body)
    message_id = getattr(record, "message_id", getattr(record, "messageId", "unknown"))
    logger.info("Processing record", extra={"message_id": message_id, "body": body})

    # TODO: replace with real domain logic, e.g.:
    #   result = some_domain_service.handle(body)
    #   infra_repo.save(result)
