# shared-core

Shared foundational utilities for Lambda services.

## What it provides

- API app builder based on `APIGatewayRestResolver`
- Common middleware: `ExceptionHandlingMiddleware`, `CorrelationIdMiddleware`, `RequestLoggingMiddleware`
- Settings model (`BaseAppSettings`) with env-driven config
- Observability helpers (`build_logger`, `build_tracer`)
- Response helpers and CORS header utilities
- Typed application exceptions (`AppError` and subclasses)
- Auth helpers and Powertools-friendly route guards for Cognito and IAM-protected handlers

## Package structure

```text
src/shared_core/
|- api/
|  |- app.py
|  `- errors.py
|- middleware/
|  |- correlation.py
|  |- exception_handler.py
|  `- request_logging.py
|- cors.py
|- auth.py
|- exceptions.py
|- observability.py
|- responses.py
`- settings.py
```

## Typical usage

```python
from shared_core.api.app import build_rest_app
from shared_core.observability import build_logger, build_tracer
from my_service.config import get_settings

settings = get_settings()
logger = build_logger(settings)
tracer = build_tracer(settings)

app = build_rest_app()
app.context["logger"] = logger
app.context["tracer"] = tracer
```

## Configuration contract

`BaseAppSettings` reads these environment variables:
- `POWERTOOLS_SERVICE_NAME`
- `SERVICE_VERSION`
- `ENVIRONMENT`
- `POWERTOOLS_LOG_LEVEL` (optional)
- `POWERTOOLS_LOG_SAMPLING_RATE` (optional)
- `APP_AWS_REGION` (optional)
- `CLOUDWATCH_NAMESPACE` (optional)
- `CORS_ALLOW_ORIGIN` (required for API services)
- `CORS_ALLOW_HEADERS` (optional)
- `CORS_ALLOW_METHODS` (optional)

## Extension points

- Add service-specific settings by subclassing `BaseAppSettings`.
- Add middleware in `build_rest_app`.
- Customize `map_exception_to_response` for API error envelopes.
- Use `requires_authenticated`, `requires_group`, and `requires_iam_identity` to keep route guards declarative.
