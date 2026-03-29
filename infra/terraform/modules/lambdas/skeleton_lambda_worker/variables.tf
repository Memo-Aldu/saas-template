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
  description = "Extra environment variables injected into the Lambda. WORKER_QUEUE_URL is always injected automatically."
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

variable "batch_size" {
  description = "Maximum number of SQS messages per Lambda invocation."
  type        = number
  default     = 10
}

variable "maximum_batching_window_seconds" {
  description = "Seconds to wait before invoking Lambda with a partial batch."
  type        = number
  default     = 5
}

variable "queue_arn" {
  description = "SQS queue ARN consumed by this worker."
  type        = string
}

variable "queue_url" {
  description = "SQS queue URL consumed by this worker."
  type        = string
}

variable "queue_name" {
  description = "SQS queue name consumed by this worker."
  type        = string
}

variable "dlq_arn" {
  description = "Dead-letter queue ARN if configured."
  type        = string
  default     = null
}

variable "dlq_url" {
  description = "Dead-letter queue URL if configured."
  type        = string
  default     = null
}

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

variable "queue_depth_alarm_threshold" {
  description = "ApproximateNumberOfMessagesVisible that triggers the queue-depth alarm. Set to 0 to disable."
  type        = number
  default     = 0
}

variable "queue_depth_evaluation_periods" {
  description = "Evaluation periods for the queue-depth alarm."
  type        = number
  default     = 3
}

variable "queue_depth_period_seconds" {
  description = "Metric period in seconds for the queue-depth alarm."
  type        = number
  default     = 60
}

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
