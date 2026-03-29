# Terraform Layout

Terraform is split into one-time backend bootstrap, reusable modules, and environment roots.

## Reusable modules

- `modules/api_gateway`
- `modules/cognito`
- `modules/dynamodb_table`
- `modules/lambdas/*`
- `modules/s3_bucket`
- `modules/sqs_queue`

## Stacks

- `stacks/core`: Cognito and shared identity primitives
- `stacks/data`: DynamoDB and S3 resources
- `stacks/services`: Lambda, queue, and API Gateway wiring

## Environment roots

- `environment/dev`
- `environment/staging`
- `environment/prod`

Each environment composes `core + data + services` and owns its own backend key and tfvars.

## Bootstrap

Bootstrap creates the remote Terraform backend resources:

- S3 bucket for remote state
- DynamoDB table for state locking

Run it once per AWS account and region pair:

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply -var="state_bucket_name=your-project-tfstate" -var="lock_table_name=your-project-tf-locks"
```

Do not commit local `.tfstate` snapshots, crash logs, or generated plans from bootstrap or environment directories.

The backend names in `environment/*/main.tf` are examples only. Update each environment root to point at the backend bucket and lock table you created during bootstrap before running `terraform init`.

## Service routing

Environment `terraform.tfvars` configure:

- `rest_lambdas`
- `worker_lambdas`

Recommended route form:

```hcl
routes = [
  {
    route              = "GET /skeleton/health"
    authorization_type = "NONE"
  },
  {
    route              = "GET /skeleton/me"
    authorization_type = "COGNITO"
  }
]
```

Routes default to Cognito auth unless `authorization_type` is explicitly overridden.

The supported template route set mirrors the shipped backend and web examples:

- `GET /skeleton/health` with `NONE`
- `GET /skeleton/me` with `COGNITO`
- `GET /skeleton/admin` with `COGNITO` and an in-Lambda admin-group check
- `GET /skeleton/private` with `AWS_IAM`

The environment examples also require two S3 buckets:

- `primary` for application data
- `artifacts` for Lambda deployment packages uploaded by Terraform

Copy one of the shipped examples before your first deploy:

```bash
cp infra/terraform/environment/dev/terraform.tfvars.example infra/terraform/environment/dev/terraform.tfvars
```

## Deploying an environment

```bash
cd infra/terraform/environment/dev
terraform init
terraform plan
terraform apply
```

Repeat for `staging` and `prod`.

After apply, use the `api_endpoint` output to build the web app backend URL:

```text
APP_API_BASE_URL = <api_endpoint>/api/v1
```

## Security and cost posture

Already enforced:

- S3 encryption and public access block
- DynamoDB encryption and point-in-time recovery
- DLQ-enabled worker queues by default
- Least-privilege Lambda access to declared buckets and tables
- API Gateway stage throttling defaults

Recommended before production launch:

- AWS Budgets and Cost Anomaly Detection
- SNS-backed alarm actions for Lambda and queue alarms
- Reserved concurrency for sensitive Lambdas
- Environment-specific CORS instead of `*`
- Review bucket lifecycle rules and log retention for your compliance needs
