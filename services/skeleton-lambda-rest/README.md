# skeleton-lambda-rest

Skeleton API Gateway REST Lambda service.

## Purpose

This service demonstrates the baseline REST setup for this template:
- Powertools REST resolver entrypoint
- Shared middleware from `shared-core`
- Health route example
- Environment-driven settings
- Gateway-driven Cognito auth with explicit public-route exceptions

## Entry points

- Lambda handler: `src/skeleton_lambda_rest/handler.py`
- App wiring: `src/skeleton_lambda_rest/api/app.py`
- Routes: `src/skeleton_lambda_rest/api/routes/`

## Route included

- `GET /skeleton/health`
- `GET /skeleton/me` protected by Cognito
- `GET /skeleton/admin` protected by Cognito and an in-Lambda admin group check
- `GET /skeleton/private` protected by API Gateway IAM for service-to-service calls

Response shape:

```json
{
  "message": "OK",
  "data": {
    "version": "x.y.z",
    "service": "service-name",
    "environment": "dev"
  }
}
```

Authenticated endpoints read Cognito claims from the API Gateway authorizer context. The `/admin` example enforces membership in the Cognito `admin` group inside Lambda, which is the recommended pattern for role-based admin access when using API Gateway Cognito authorizers. The `/private` example is intended for signed AWS service-to-service calls using IAM authorization.

## Required environment variables

- `POWERTOOLS_SERVICE_NAME`
- `SERVICE_VERSION`
- `ENVIRONMENT`

Optional:
- `POWERTOOLS_LOG_LEVEL`
- `POWERTOOLS_LOG_SAMPLING_RATE`
- `APP_AWS_REGION`
- `CLOUDWATCH_NAMESPACE`
- `CORS_ALLOW_HEADERS`
- `CORS_ALLOW_METHODS`

Required for API services:
- `CORS_ALLOW_ORIGIN`

## Package this service

From repository root:

```bash
make package SERVICE=services/skeleton-lambda-rest
```

Artifact:

```text
dist/skeleton-lambda-rest.zip
```

## Extend this template

1. Add route modules in `api/routes/`.
2. Register them from `api/routes/__init__.py`.
3. Mark public routes explicitly in Terraform; application routes default to Cognito auth.
4. Implement business logic under `domain/`, `service/`, and `infra/`.
5. Add tests under `tests/` using REST proxy event fixtures.
