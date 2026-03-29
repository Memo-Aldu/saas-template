# CI/CD Setup

This repository now separates validation, trusted artifact creation, and environment deployment:

- `.github/workflows/ci.yml`
- `.github/workflows/artifact-build.yml`
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-prod.yml`

The deploy workflows call `.github/workflows/_deploy-environment.yml` so the Terraform plan/apply path stays identical across environments.

## Required GitHub configuration

Create these GitHub Environments and configure required reviewers:

- `dev`
- `staging`
- `prod`

Create these repository variables:

- `AWS_REGION_DEV`
- `AWS_REGION_STAGING`
- `AWS_REGION_PROD`
- `AWS_ROLE_ARN_DEV`
- `AWS_ROLE_ARN_STAGING`
- `AWS_ROLE_ARN_PROD`
- `DEV_TFVARS_JSON`
- `STAGING_TFVARS_JSON`
- `PROD_TFVARS_JSON`

`AWS_ROLE_ARN_*` should point at IAM roles trusted by GitHub OIDC for this repository. Scope each role to the target environment only.

Create these repository secrets when you do not commit `terraform.tfvars` and need sensitive Terraform input:

- `DEV_TFVARS_SECRET_JSON`
- `STAGING_TFVARS_SECRET_JSON`
- `PROD_TFVARS_SECRET_JSON`

`*_TFVARS_JSON` should contain a JSON object with non-secret Terraform inputs. `*_TFVARS_SECRET_JSON` should contain a JSON object with sensitive Terraform inputs. During deployment, the workflow selects the values that match the target environment and merges them into `terraform.auto.tfvars.json` inside the target Terraform root before `terraform init/plan/apply`.

Example `DEV_TFVARS_JSON`:

```json
{
  "project": "interview-loom",
  "environment": "dev",
  "region": "us-east-1",
  "cors_allow_origin": "http://localhost:3000",
  "cognito_callback_urls": [
    "http://localhost:3000/api/auth/callback/cognito"
  ],
  "cognito_logout_urls": [
    "http://localhost:3000"
  ],
  "dynamodb_tables": {
    "app": {
      "table_name": "interview-loom-dev-app",
      "hash_key": "pk",
      "range_key": "sk",
      "attributes": [
        { "name": "pk", "type": "S" },
        { "name": "sk", "type": "S" }
      ],
      "billing_mode": "PAY_PER_REQUEST",
      "enable_point_in_time_recovery": true
    }
  },
  "s3_buckets": {
    "primary": {
      "bucket_name": "interview-loom-dev-data-001",
      "force_destroy": false,
      "versioning_enabled": true,
      "sse_algorithm": "AES256",
      "bucket_key_enabled": true,
      "lifecycle_rules": []
    },
    "artifacts": {
      "bucket_name": "interview-loom-dev-lambda-artifacts-001",
      "force_destroy": false,
      "versioning_enabled": true,
      "sse_algorithm": "AES256",
      "bucket_key_enabled": true,
      "lifecycle_rules": []
    }
  }
}
```

Example `DEV_TFVARS_SECRET_JSON`:

```json
{
  "cognito_google_identity_provider": {
    "client_id": "",
    "client_secret": "",
    "enabled": false
  },
  "cognito_apple_identity_provider": {
    "client_id": "",
    "team_id": "",
    "key_id": "",
    "private_key": "",
    "enabled": false
  }
}
```

This setup keeps Terraform config at the repository level, so `plan` can run immediately while `apply` still pauses on the target GitHub Environment for manual approval.

Current recommended GitHub setup:

- Repository variables:
  - `AWS_REGION_DEV`
  - `AWS_REGION_STAGING`
  - `AWS_REGION_PROD`
  - `AWS_ROLE_ARN_DEV`
  - `AWS_ROLE_ARN_STAGING`
  - `AWS_ROLE_ARN_PROD`
  - `DEV_TFVARS_JSON`
  - `STAGING_TFVARS_JSON`
  - `PROD_TFVARS_JSON`
- Repository secrets:
  - `DEV_TFVARS_SECRET_JSON`
  - `STAGING_TFVARS_SECRET_JSON`
  - `PROD_TFVARS_SECRET_JSON`
- GitHub Environments:
  - `dev`
  - `staging`
  - `prod`

Put required reviewers on the deployment environments if you want approval before apply.

## Release flow

1. Pull requests and pushes to `main` run `ci.yml` for validation only.
2. `ci.yml` also performs a Lambda packaging smoke test and uploads the built `dist/*.zip` files as short-lived CI artifacts.
3. Pushes to `main` run `artifact-build.yml` to build trusted Lambda zip artifacts from source.
4. A manual deploy workflow downloads the selected artifact build, creates a Terraform plan, uploads a reviewed deployment bundle, and waits for environment approval.
5. After GitHub Environment approval, the apply job runs `terraform apply` against the exact saved plan file and the exact `dist/*.zip` bundle produced during the plan job.

## Bootstrap

Terraform bootstrap remains manual. Do not automate `infra/terraform/bootstrap` apply through GitHub Actions.

## Notes

- The Next.js app is validated and built in CI, but not runtime-deployed by these workflows.
- Python Lambda services are discovered from `services/*/pyproject.toml`, so new services flow through typecheck, test, and packaging without workflow edits.
- Terraform deploys expect Lambda zips under `dist/`, and the reviewed deployment bundle preserves those exact files from plan to apply.
- Artifact retention is set to 30 days for both Lambda artifacts and Terraform plans.
