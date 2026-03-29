variable "project" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "service_version" {
  description = "Application version."
  type        = string
  default     = "0.1.0"
}

variable "api_version" {
  description = "Version segment appended to REST API routes."
  type        = string
  default     = "v1"
}

variable "enable_cognito" {
  description = "Whether Cognito-backed route authorization is enabled."
  type        = bool
  default     = false
}

variable "cognito_user_pool_arn" {
  description = "Cognito user pool ARN used by API Gateway authorizers."
  type        = string
  default     = null
}

variable "lambda_managed_policy_arns" {
  description = "Managed IAM policy ARNs attached to each Lambda execution role."
  type        = list(string)
  default = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
  ]
}

variable "lambda_runtime" {
  description = "Lambda runtime."
  type        = string
  default     = "python3.13"
}

variable "lambda_memory_mb" {
  description = "Default Lambda memory in MB."
  type        = number
  default     = 256
}

variable "lambda_timeout_seconds" {
  description = "Default REST Lambda timeout in seconds."
  type        = number
  default     = 29
}

variable "worker_timeout_seconds" {
  description = "Default worker Lambda timeout in seconds."
  type        = number
  default     = 300
}

variable "worker_batch_size" {
  description = "Default SQS batch size for worker Lambda."
  type        = number
  default     = 10
}

variable "worker_queue_visibility_timeout_offset_seconds" {
  description = "Extra seconds added to worker queue visibility timeout over Lambda timeout."
  type        = number
  default     = 30
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 14
}

variable "cors_allow_origin" {
  description = "Allowed CORS origin."
  type        = string
  default     = "*"
}

variable "cors_allow_headers" {
  description = "Allowed CORS headers."
  type        = string
  default     = "Content-Type,Authorization,X-Correlation-Id"
}

variable "cors_allow_methods" {
  description = "Allowed CORS methods."
  type        = string
  default     = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
}

variable "api_stage_throttling_burst_limit" {
  description = "Default burst limit applied to the API Gateway stage."
  type        = number
  default     = 100
}

variable "api_stage_throttling_rate_limit" {
  description = "Default rate limit applied to the API Gateway stage."
  type        = number
  default     = 50
}

variable "lambda_artifact_bucket_name" {
  description = "S3 bucket used to store Lambda deployment artifacts."
  type        = string
}

variable "dynamodb_tables" {
  description = "Map of known DynamoDB tables by key."
  type = map(object({
    name = string
    arn  = string
  }))
  default = {}
}

variable "s3_buckets" {
  description = "Map of known S3 buckets by key."
  type = map(object({
    name = string
    arn  = string
  }))
  default = {}
}

variable "rest_lambdas" {
  description = "REST Lambda configuration map."
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
}

variable "worker_lambdas" {
  description = "Worker Lambda configuration map. Each worker gets its own queue (and optional DLQ)."
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
  default = {}
}

variable "common_lambda_environment" {
  description = "Shared extra env vars for all lambdas."
  type        = map(string)
  default     = {}
}

variable "alarm_actions" {
  description = "Alarm actions for lambda alarms."
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "OK actions for lambda alarms."
  type        = list(string)
  default     = []
}

variable "default_rest_lambda_key" {
  description = "REST lambda key used for backward-compatible single-lambda outputs."
  type        = string
  default     = "rest"
}

variable "default_worker_lambda_key" {
  description = "Worker lambda key used for backward-compatible single-worker outputs."
  type        = string
  default     = "worker"
}

variable "tags" {
  description = "Additional tags."
  type        = map(string)
  default     = {}
}
