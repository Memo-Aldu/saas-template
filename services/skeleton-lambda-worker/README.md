# skeleton-lambda-worker

Skeleton event-driven Lambda service for SQS batch processing.

## Purpose

This service demonstrates a worker baseline:
- Powertools BatchProcessor with partial batch failure handling
- Record-level processing function (`process_record`)
- Shared logger/tracer initialization

## Entry points

- Lambda handler: `src/skeleton_lambda_worker/handler.py`
- Record logic: `src/skeleton_lambda_worker/service/job_service.py`

## Event handling model

- Trigger: SQS event source mapping
- Batch failures are returned as `PartialItemFailureResponse`
- Failed records are retried; successful records are not retried

## Required environment variables

- `POWERTOOLS_SERVICE_NAME`
- `SERVICE_VERSION`
- `ENVIRONMENT`

Optional:
- `POWERTOOLS_LOG_LEVEL`
- `POWERTOOLS_LOG_SAMPLING_RATE`
- `APP_AWS_REGION`
- `APP_NAMESPACE`

## Package this service

From repository root:

```bash
make package SERVICE=services/skeleton-lambda-worker
```

Artifact:

```text
dist/skeleton-lambda-worker.zip
```

## Extend this template

1. Replace `process_record` with your domain workflow.
2. Validate payload schema before processing.
3. Add idempotency protections for retries.
4. Add tests for success, partial failure, and malformed events.
