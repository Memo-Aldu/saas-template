# Serverless SaaS Template

Full-stack SaaS starter template with:

- `apps/web`: Next.js app with Cognito-backed auth flows
- `packages/ui`: shared React UI primitives
- `packages/contracts`: shared TypeScript API contracts
- `packages/python/*`: shared Python libraries for Lambda services
- `services/*`: REST and worker Lambda skeletons
- `infra/terraform`: reusable Terraform modules and environment stacks

## Prerequisites

- Node.js 22+
- npm
- Python 3.13
- `uv`
- `make`

## Quick start

1. Install dependencies:

```bash
npm ci
make sync
```

2. Start the web app locally:

```bash
cp apps/web/.env.example apps/web/.env.local
npm --workspace apps/web run dev
```

3. Verify the full local workspace:

```bash
npm run verify
```

## Repository layout

```text
.
|- apps/
|  |- web/
|- packages/
|  |- contracts/
|  |- ui/
|  |- python/
|     |- aws-utils/
|     |- domain-models/
|     |- shared-core/
|- services/
|  |- skeleton-lambda-rest/
|  |- skeleton-lambda-worker/
|- infra/
|  |- terraform/
|- scripts/
|- Makefile
|- package.json
|- pyproject.toml
|- uv.lock
```

## Top-level commands

- `npm run lint`: web lint plus Python Ruff checks
- `npm run typecheck`: web typecheck plus Python mypy checks
- `npm run test`: web tests plus REST and worker pytest suites
- `npm run build`: shared package builds plus the Next.js production build
- `npm run package:services`: package both Lambda services
- `npm run verify`: full repo verification, including packaging smoke tests

## Terraform setup

1. Bootstrap remote state once per AWS account and region:

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply -var="state_bucket_name=your-project-tfstate" -var="lock_table_name=your-project-tf-locks"
```

2. Copy an environment example before your first deploy:

```bash
cp infra/terraform/environment/dev/terraform.tfvars.example infra/terraform/environment/dev/terraform.tfvars
```

3. Customize these values before `terraform init` or `terraform apply`:

- Terraform backend names inside `infra/terraform/environment/*/main.tf`
- `project`
- `cognito_*` names and callback/logout URLs
- `s3_buckets.primary.bucket_name`
- `s3_buckets.artifacts.bucket_name`
- `dynamodb_tables.app.table_name`
- `cors_allow_origin`

4. Deploy an environment:

```bash
cd infra/terraform/environment/dev
terraform init
terraform plan
terraform apply
```

5. Point the web app at the deployed API:

- Read the `api_endpoint` Terraform output from the environment.
- Set `APP_API_BASE_URL` in `apps/web/.env.local` to `${api_endpoint}/api/v1`.

## Development notes

- Browser sessions expose user-facing identity, not raw Cognito bearer tokens.
- The dashboard includes a route explorer and a server-mediated backend identity panel.
- Terraform state and deployment artifacts are intentionally not tracked.

## Security notes

Enforced by Terraform:

- S3 public access block and server-side encryption
- DynamoDB server-side encryption and point-in-time recovery
- Least-privilege Lambda data access policies
- Cognito app client token revocation and user-existence protection
- API Gateway throttling defaults and CloudWatch log retention

Recommended follow-up hardening for deployed environments:

- Configure AWS Budgets and Cost Anomaly Detection
- Tighten `cors_allow_origin` to your real frontend domain
- Wire CloudWatch alarm actions to SNS / PagerDuty / Slack
- Consider Lambda reserved concurrency for critical or abuse-prone functions
- Review API Gateway throttling and per-route overrides for public endpoints

See [apps/web/README.md](apps/web/README.md) and [infra/terraform/README.md](/infra/terraform/README.md) for setup details.
