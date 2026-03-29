variable "project" {
  description = "Project name"
  type        = string
  default     = "saas-template"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "service_version" {
  description = "Service version propagated to Lambda environment variables."
  type        = string
  default     = "0.1.0"
}

variable "api_version" {
  description = "Version segment appended to REST API routes."
  type        = string
  default     = "v1"
}

variable "lambda_runtime" {
  description = "Lambda runtime identifier."
  type        = string
  default     = "python3.13"
}

variable "lambda_memory_mb" {
  description = "Default memory in MB assigned to Lambdas."
  type        = number
  default     = 512
}

variable "lambda_timeout_seconds" {
  description = "Default timeout for REST Lambdas."
  type        = number
  default     = 29
}

variable "worker_timeout_seconds" {
  description = "Default timeout for worker Lambdas."
  type        = number
  default     = 300
}

variable "worker_batch_size" {
  description = "Default SQS batch size for worker Lambda event source mapping."
  type        = number
  default     = 10
}

variable "log_retention_days" {
  description = "CloudWatch log retention days."
  type        = number
  default     = 30
}

variable "cors_allow_origin" {
  description = "Allowed CORS origin."
  type        = string
  default     = "*"
}

variable "rest_lambdas" {
  description = "REST lambdas keyed by service name."
  type = map(object({
    handler               = string
    artifact_source_path  = string
    artifact_key          = string
    memory_size           = optional(number)
    timeout               = optional(number)
    environment_variables = optional(map(string))
    dynamodb_table_access = optional(list(string))
    s3_bucket_access      = optional(list(string))
    routes                = optional(list(any))
  }))
  default = {
    rest = {
      handler              = "skeleton_lambda_rest.handler.handler"
      artifact_source_path = "../../../../dist/skeleton-lambda-rest.zip"
      artifact_key         = "lambdas/rest.zip"
      routes = [
        {
          route              = "GET /skeleton/health"
          authorization_type = "NONE"
        },
        {
          route              = "GET /skeleton/me"
          authorization_type = "COGNITO"
        },
        {
          route              = "GET /skeleton/admin"
          authorization_type = "COGNITO"
        },
        {
          route              = "GET /skeleton/private"
          authorization_type = "AWS_IAM"
        },
      ]
      dynamodb_table_access = ["app"]
      s3_bucket_access      = ["primary"]
    }
  }
}

variable "worker_lambdas" {
  description = "Worker lambdas keyed by service name."
  type = map(object({
    handler               = string
    artifact_source_path  = string
    artifact_key          = string
    memory_size           = optional(number)
    timeout               = optional(number)
    environment_variables = optional(map(string))
    dynamodb_table_access = optional(list(string))
    s3_bucket_access      = optional(list(string))
    queue = optional(object({
      name                            = optional(string)
      visibility_timeout_seconds      = optional(number)
      batch_size                      = optional(number)
      max_receive_count               = optional(number)
      maximum_batching_window_seconds = optional(number)
      create_dlq                      = optional(bool)
      dlq_message_retention_seconds   = optional(number)
      queue_depth_alarm_threshold     = optional(number)
      queue_depth_evaluation_periods  = optional(number)
      queue_depth_period_seconds      = optional(number)
    }))
  }))
  default = {
    worker = {
      handler               = "skeleton_lambda_worker.handler.handler"
      artifact_source_path  = "../../../../dist/skeleton-lambda-worker.zip"
      artifact_key          = "lambdas/worker.zip"
      dynamodb_table_access = ["app"]
      s3_bucket_access      = ["primary"]
    }
  }
}

variable "common_lambda_environment" {
  description = "Shared extra env vars for all lambdas."
  type        = map(string)
  default     = {}
}

variable "enable_cognito" {
  description = "Whether to create Cognito resources in core stack."
  type        = bool
  default     = true
}

variable "cognito_user_pool_name" {
  description = "Cognito user pool name."
  type        = string
  default     = "saas-template-staging-users"
}

variable "cognito_user_pool_client_name" {
  description = "Cognito user pool client name."
  type        = string
  default     = "saas-template-staging-client"
}

variable "cognito_groups" {
  description = "Cognito user pool groups keyed by group name."
  type = map(object({
    description = optional(string)
    precedence  = optional(number)
    role_arn    = optional(string)
  }))
  default = {
    admin = {
      description = "Administrative users with elevated API access."
      precedence  = 1
    }
  }
}

variable "cognito_domain_prefix" {
  description = "Optional Cognito domain prefix."
  type        = string
  default     = null
}

variable "cognito_callback_urls" {
  description = "Cognito callback URLs."
  type        = list(string)
  default     = ["https://staging.example.com/api/auth/callback/cognito"]
}

variable "cognito_logout_urls" {
  description = "Cognito logout URLs."
  type        = list(string)
  default     = ["https://staging.example.com"]
}

variable "cognito_supported_identity_providers" {
  description = "Identity providers enabled for the Cognito app client."
  type        = list(string)
  default     = ["COGNITO"]
}

variable "cognito_google_identity_provider" {
  description = "Optional Google identity provider configuration."
  type = object({
    client_id     = string
    client_secret = string
    enabled       = optional(bool, false)
  })
  default = {
    client_id     = ""
    client_secret = ""
    enabled       = false
  }
}

variable "cognito_apple_identity_provider" {
  description = "Optional Apple identity provider configuration."
  type = object({
    client_id   = string
    team_id     = string
    key_id      = string
    private_key = string
    enabled     = optional(bool, false)
  })
  default = {
    client_id   = ""
    team_id     = ""
    key_id      = ""
    private_key = ""
    enabled     = false
  }
}

variable "dynamodb_tables" {
  description = "Map of dynamodb table definitions."
  type        = map(any)
  default = {
    app = {
      table_name = "saas-template-staging-app"
      hash_key   = "pk"
      range_key  = "sk"
      attributes = [
        { name = "pk", type = "S" },
        { name = "sk", type = "S" }
      ]
      billing_mode                  = "PAY_PER_REQUEST"
      enable_point_in_time_recovery = true
    }
  }
}

variable "s3_buckets" {
  description = "Map of S3 bucket definitions."
  type = map(object({
    bucket_name        = string
    force_destroy      = optional(bool)
    versioning_enabled = optional(bool)
    sse_algorithm      = optional(string)
    kms_key_id         = optional(string)
    bucket_key_enabled = optional(bool)
    lifecycle_rules = optional(list(object({
      id                                     = string
      enabled                                = bool
      prefix                                 = optional(string)
      expiration_days                        = optional(number)
      noncurrent_version_expiration_days     = optional(number)
      abort_incomplete_multipart_upload_days = optional(number)
    })), [])
  }))
  default = {
    primary = {
      bucket_name = "saas-template-staging-data-001"
    }
    artifacts = {
      bucket_name = "saas-template-staging-lambda-artifacts-001"
    }
  }
}
