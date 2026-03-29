variable "function_name" {
  description = "Lambda function name."
  type        = string
}

variable "managed_policy_arns" {
  description = "Managed IAM policy ARNs attached to the Lambda execution role."
  type        = list(string)
  default = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
  ]
}

variable "handler" {
  description = "Lambda handler in module.file.function format."
  type        = string
}

variable "runtime" {
  description = "Lambda runtime identifier (e.g. python3.13)."
  type        = string
}

variable "memory_size" {
  description = "Lambda memory allocation in MB."
  type        = number
}

variable "timeout" {
  description = "Lambda execution timeout in seconds."
  type        = number
}

variable "artifact_bucket_name" {
  description = "S3 bucket that holds the deployment zip."
  type        = string
}

variable "artifact_key" {
  description = "S3 object key for the deployment zip."
  type        = string
}

variable "artifact_source_path" {
  description = "Local path to the deployment zip (used for hash and upload)."
  type        = string
}

variable "environment_variables" {
  description = "Environment variables injected into the Lambda."
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  description = "CloudWatch log group retention in days."
  type        = number
  default     = 14
}

variable "tracing_mode" {
  description = "AWS X-Ray tracing mode (Active | PassThrough)."
  type        = string
  default     = "Active"
}

# Alarm config

variable "alarm_actions" {
  description = "SNS topic ARNs notified when an alarm fires."
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "SNS topic ARNs notified when an alarm recovers."
  type        = list(string)
  default     = []
}

variable "errors_threshold" {
  description = "Error count that triggers the errors alarm."
  type        = number
  default     = 1
}

variable "errors_evaluation_periods" {
  description = "Evaluation periods for the errors alarm."
  type        = number
  default     = 1
}

variable "errors_period_seconds" {
  description = "Metric period in seconds for the errors alarm."
  type        = number
  default     = 60
}

variable "throttles_threshold" {
  description = "Throttle count that triggers the throttles alarm."
  type        = number
  default     = 1
}

variable "throttles_evaluation_periods" {
  description = "Evaluation periods for the throttles alarm."
  type        = number
  default     = 1
}

variable "throttles_period_seconds" {
  description = "Metric period in seconds for the throttles alarm."
  type        = number
  default     = 60
}

# Data access

variable "dynamodb_table_arns" {
  description = "DynamoDB table ARNs this Lambda is allowed to read/write."
  type        = list(string)
  default     = []
}

variable "s3_bucket_arns" {
  description = "S3 bucket ARNs this Lambda is allowed to read/write."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags applied to all resources."
  type        = map(string)
  default     = {}
}
