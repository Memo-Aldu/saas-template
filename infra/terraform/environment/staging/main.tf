terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
  }
  backend "s3" {
    bucket         = "saas-template-tfstate-001"
    key            = "envs/staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "saas-template-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
      Stack       = "serverless-app"
    }
  }
}

check "artifacts_bucket_declared" {
  assert {
    condition     = contains(keys(var.s3_buckets), "artifacts")
    error_message = "Environment s3_buckets must define an 'artifacts' bucket for Lambda deployment packages."
  }
}

module "core" {
  source = "../../stacks/core"

  project                              = var.project
  environment                          = var.environment
  region                               = var.region
  enable_cognito                       = var.enable_cognito
  cognito_user_pool_name               = var.cognito_user_pool_name
  cognito_user_pool_client_name        = var.cognito_user_pool_client_name
  cognito_groups                       = var.cognito_groups
  cognito_domain_prefix                = var.cognito_domain_prefix
  cognito_callback_urls                = var.cognito_callback_urls
  cognito_logout_urls                  = var.cognito_logout_urls
  cognito_supported_identity_providers = var.cognito_supported_identity_providers
  cognito_google_identity_provider     = var.cognito_google_identity_provider
  cognito_apple_identity_provider      = var.cognito_apple_identity_provider
}

module "data" {
  source = "../../stacks/data"

  dynamodb_tables = var.dynamodb_tables
  s3_buckets      = var.s3_buckets
}

module "services" {
  source = "../../stacks/services"

  project                = var.project
  environment            = var.environment
  aws_region             = var.region
  service_version        = var.service_version
  api_version            = var.api_version
  enable_cognito         = var.enable_cognito
  cognito_user_pool_arn  = module.core.cognito_user_pool_arn
  lambda_runtime         = var.lambda_runtime
  lambda_memory_mb       = var.lambda_memory_mb
  lambda_timeout_seconds = var.lambda_timeout_seconds
  worker_timeout_seconds = var.worker_timeout_seconds
  worker_batch_size      = var.worker_batch_size
  log_retention_days     = var.log_retention_days
  cors_allow_origin      = var.cors_allow_origin

  lambda_artifact_bucket_name = module.data.s3_bucket_names["artifacts"]
  rest_lambdas                = var.rest_lambdas
  worker_lambdas              = var.worker_lambdas
  common_lambda_environment   = var.common_lambda_environment

  dynamodb_tables = {
    for key, name in module.data.dynamodb_table_names : key => {
      name = name
      arn  = module.data.dynamodb_table_arns[key]
    }
  }

  s3_buckets = {
    for key, name in module.data.s3_bucket_names : key => {
      name = name
      arn  = module.data.s3_bucket_arns[key]
    }
  }
}
