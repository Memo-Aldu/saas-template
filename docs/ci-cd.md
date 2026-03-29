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

- `AWS_REGION`
- `AWS_ROLE_ARN_DEV`
- `AWS_ROLE_ARN_STAGING`
- `AWS_ROLE_ARN_PROD`

`AWS_ROLE_ARN_*` should point at IAM roles trusted by GitHub OIDC for this repository. Scope each role to the target environment only.

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
