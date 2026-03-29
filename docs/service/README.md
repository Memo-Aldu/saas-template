# Service Architecture

This page describes how the current reference service is assembled across frontend, backend, and infrastructure.

## Runtime building blocks

### Frontend

- `apps/web` is a Next.js application.
- It handles sign-up, verify-email, forgot-password, reset-password, and sign-in flows against Cognito.
- It also exposes BFF routes under `apps/web/src/app/api/bff/*` so the browser does not call the backend API directly for authenticated user flows.

### REST service

- `services/skeleton-lambda-rest` is an AWS Lambda fronted by API Gateway REST.
- The Lambda uses `aws-lambda-powertools` `APIGatewayRestResolver`.
- Shared middleware from `packages/python/shared-core` adds:
  - exception normalization
  - correlation IDs
  - request logging

### Worker service

- `services/skeleton-lambda-worker` is an SQS-triggered Lambda.
- It uses Powertools `BatchProcessor` so failed records are retried without replaying successful ones in the same batch.
- The current worker is scaffold-only and logs the parsed SQS payload.

### Infrastructure

- `infra/terraform/environment/*` composes the stack for each environment.
- `infra/terraform/stacks/core` provisions shared platform components such as Cognito.
- `infra/terraform/stacks/services` provisions:
  - REST Lambdas
  - worker Lambdas
  - API Gateway
  - SQS queues
  - CloudWatch log groups and alarms

## Component diagram

```mermaid
flowchart TB
    subgraph Client
        Browser[Browser]
    end

    subgraph Frontend
        Next[Next.js app]
        Session[NextAuth JWT session]
        BFF[BFF routes]
    end

    subgraph Identity
        Cognito[Cognito user pool\nand app client]
    end

    subgraph Backend
        APIGW[API Gateway REST stage]
        Rest[REST Lambda]
        Shared[shared-core middleware\nand auth helpers]
    end

    subgraph Async
        SQS[SQS queue]
        Worker[Worker Lambda]
    end

    subgraph Data
        DDB[DynamoDB]
        S3[S3]
    end

    Browser --> Next
    Next --> Session
    Next --> Cognito
    Next --> BFF
    BFF --> APIGW
    APIGW --> Rest
    Rest --> Shared
    Rest --> DDB
    Rest --> S3
    Rest -. optional async work .-> SQS
    SQS --> Worker
    Worker --> DDB
    Worker --> S3
```

## Request lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant W as Next.js app
    participant C as Cognito
    participant B as BFF route
    participant G as API Gateway
    participant L as REST Lambda

    U->>W: Sign in or open dashboard
    W->>C: Authenticate user
    C-->>W: Tokens returned
    W->>B: GET /api/bff/me
    B->>G: GET /api/v1/skeleton/me + Bearer idToken
    G->>G: Validate Cognito token
    G->>L: Invoke Lambda
    L-->>B: SuccessResponse JSON
    B-->>W: Forward validated JSON
    W-->>U: Render authenticated state
```

## Authorization model

There are two layers:

1. API Gateway route authorization
2. Lambda-side authorization rules

Current route strategy:

| Route | API Gateway auth | Lambda-side rule |
| --- | --- | --- |
| `/api/v1/skeleton/health` | `NONE` | none |
| `/api/v1/skeleton/me` | `COGNITO` | reads caller claims |
| `/api/v1/skeleton/admin` | `COGNITO` | requires Cognito `admin` group |
| `/api/v1/skeleton/private` | `AWS_IAM` | requires IAM identity context |

## Deployment shape

`infra/terraform/stacks/services/main.tf` converts service route declarations into API Gateway integrations by:

- prepending the shared API base path `/api/v1`
- selecting one of `NONE`, `COGNITO`, or `AWS_IAM` per route
- attaching the route to the target Lambda
- enabling stage-level logging, metrics, tracing, and throttling

That means the service code owns handler behavior, but Terraform owns the public contract surface and authorization mode at the gateway edge.

## Important caveat

The browser-facing BFF can call the Cognito-protected backend routes because it forwards a Cognito token. The IAM-only route is different: a plain browser fetch cannot satisfy API Gateway `AWS_IAM` authorization. That route is intended for signed AWS service-to-service access unless the app later introduces SigV4 signing on the caller side.
