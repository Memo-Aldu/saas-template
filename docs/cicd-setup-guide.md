# End-to-End CI/CD Setup Guide

This guide walks through the full setup for this repository's CI/CD pipeline:

1. Bootstrap the Terraform remote backend in AWS.
2. Configure the environment Terraform roots.
3. Create GitHub Environments.
4. Create AWS IAM roles for GitHub Actions via OIDC.
5. Add GitHub repository variables and secrets.
6. Run the first deployment.

This repo separates:

- validation in `.github/workflows/ci.yml`
- trusted artifact creation in `.github/workflows/artifact-build.yml`
- manual deployment in `.github/workflows/deploy-dev.yml`, `.github/workflows/deploy-staging.yml`, and `.github/workflows/deploy-prod.yml`

## 1. Prerequisites

You need:

- a GitHub repository with Actions enabled
- an AWS account for the target environment
- permission in AWS to create IAM roles, an OIDC provider, S3 buckets, and DynamoDB tables
- Terraform 1.9+
- AWS CLI authenticated to the target AWS account for the one-time bootstrap

## 2. Bootstrap the Terraform backend

GitHub Actions deploys expect Terraform remote state to already exist. Bootstrap is intentionally manual.

The bootstrap stack creates:

- an S3 bucket for Terraform state
- a DynamoDB table for state locking

Run this once per AWS account and region:

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply \
  -var="state_bucket_name=interview-loom-tfstate-001" \
  -var="lock_table_name=interview-loom-tf-locks"
```

After apply, note the outputs:

- `state_bucket`
- `lock_table`

References:

- [bootstrap main.tf](/infra/terraform/bootstrap/main.tf)
- [bootstrap outputs.tf](/infra/terraform/bootstrap/outputs.tf)
- [terraform README](/infra/terraform/README.md#L28)

## 3. Point each environment at the backend

Update the backend block in the environment root, for example:

- [dev main.tf](/infra/terraform/environment/dev/main.tf#L9)

Make sure these values are correct:

- `bucket`
- `dynamodb_table`
- `region`
- `key`

Example:

```hcl
backend "s3" {
  bucket         = "interview-loom-tfstate-001"
  key            = "envs/dev/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "interview-loom-tf-locks"
  encrypt        = true
}
```

## 4. Create the GitHub OIDC provider in AWS

This pipeline uses GitHub OpenID Connect so you do not need long-lived AWS keys in GitHub secrets.

Create an IAM OIDC provider in AWS with:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

References:

- [GitHub OIDC in AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [AWS IAM OIDC provider docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html)

## 5. Create the deploy role in AWS

Create an IAM role for each environment, for example:

- `GitHubActionsDeployDev`
- `GitHubActionsDeployStaging`
- `GitHubActionsDeployProd`

The role must trust the GitHub OIDC provider and allow `sts:AssumeRoleWithWebIdentity`.

### Trust policy example

Replace:

- `ACCOUNT_ID`
- `ORG`
- `REPO`

with your real values.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:ORG/REPO:environment:dev"
        }
      }
    }
  ]
}
```

### Permissions policy

The role needs enough AWS permissions for Terraform to create and update the resources managed by this repo, including:

- S3
- DynamoDB
- Lambda
- IAM
- API Gateway
- SQS
- Cognito
- CloudWatch Logs
- CloudWatch Alarms
- Application Auto Scaling

The role ARN you create here becomes `AWS_ROLE_ARN_DEV` in GitHub.

## 6. Create GitHub repository variables

Go to:

`GitHub repo -> Settings -> Secrets and variables -> Actions -> Variables`

Create:

- `AWS_REGION_DEV`
- `AWS_REGION_STAGING`
- `AWS_REGION_PROD`
- `AWS_ROLE_ARN_DEV`
- `AWS_ROLE_ARN_STAGING`
- `AWS_ROLE_ARN_PROD`
- `DEV_TFVARS_JSON`
- `STAGING_TFVARS_JSON`
- `PROD_TFVARS_JSON`

Minimum for `dev`:

- `AWS_REGION_DEV=us-east-1`
- `AWS_ROLE_ARN_DEV=arn:aws:iam::<account-id>:role/GitHubActionsDeployDev`

References:

- [docs/ci-cd.md](/docs/ci-cd.md#L21)
- [deploy-dev.yml](/.github/workflows/deploy-dev.yml)

## 7. Create the GitHub Environment

Go to:

`GitHub repo -> Settings -> Environments`

Create:

- `dev`
- `staging`
- `prod`

For a first pass, `dev` is enough.

You can optionally add:

- required reviewers
- wait timers
- deployment branch restrictions

## 8. Add Terraform input at the repository level

If you do not want to commit `terraform.tfvars`, store Terraform input at the repository level and key it by environment name.

For repository variables, go to:

`GitHub repo -> Settings -> Secrets and variables -> Actions -> Variables`

Add:

- `DEV_TFVARS_JSON`
- `STAGING_TFVARS_JSON`
- `PROD_TFVARS_JSON`

For repository secrets, go to:

`GitHub repo -> Settings -> Secrets and variables -> Actions -> Secrets`

Add:

- `DEV_TFVARS_SECRET_JSON`
- `STAGING_TFVARS_SECRET_JSON`
- `PROD_TFVARS_SECRET_JSON`

Put non-secret values in `*_TFVARS_JSON`.
Put sensitive values in `*_TFVARS_SECRET_JSON`.

### Example `DEV_TFVARS_JSON`

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

### Example `DEV_TFVARS_SECRET_JSON`

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

The workflow selects the JSON that matches the target environment and merges it into `terraform.auto.tfvars.json` during deploy.

Summary of what to create in GitHub:

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
- Environments:
  - `dev`
  - `staging`
  - `prod`

Add required reviewers to `dev`, `staging`, and `prod` if you want manual approval before apply.

## 9. Trigger the artifact build

Before deploying, you need at least one successful artifact build on `main`.

This happens on push to `main` via:

- [artifact-build.yml](/.github/workflows/artifact-build.yml)

## 10. Run the first dev deployment

Go to:

`GitHub repo -> Actions -> Deploy Dev -> Run workflow`

Leave `artifact_run_id` as `latest` to use the latest successful artifact build from `main`.

The deploy flow is:

1. Download the selected built artifacts.
2. Generate `terraform.auto.tfvars.json` from the repository-level environment-specific values.
3. Run `terraform init`.
4. Run `terraform plan`.
5. Save the exact plan and artifacts.
6. Run `terraform apply` using the exact reviewed plan bundle.

Approval behavior:

- `plan` reads config from repository-level `DEV_TFVARS_JSON` and `DEV_TFVARS_SECRET_JSON`
- `apply` targets the `dev` GitHub Environment
- if `dev` has required reviewers configured, GitHub pauses after plan and waits for your approval before apply runs

Reusable workflow note:

- the top-level deploy workflow must grant `actions: read`, `contents: read`, and `id-token: write`
- the deploy wrapper workflows in this repo now declare those permissions explicitly

## 11. Troubleshooting checklist

If deploy fails, check these first:

1. Backend bucket and DynamoDB lock table exist in AWS.
2. The backend block in `infra/terraform/environment/dev/main.tf` matches the real backend names.
3. `AWS_REGION` and `AWS_ROLE_ARN_DEV` exist as repository variables.
4. `DEV_TFVARS_JSON` is valid JSON.
5. `DEV_TFVARS_SECRET_JSON` is valid JSON.
6. A successful `artifact-build.yml` run exists on `main`.
7. The AWS role trust policy matches your GitHub org, repo, and environment name.
8. The AWS role permissions are broad enough for the Terraform resources in this repo.

## Related docs

- [CI/CD Setup](/docs/ci-cd.md)
- [Terraform README](/infra/terraform/README.md)
- [Repo README](/README.md)
