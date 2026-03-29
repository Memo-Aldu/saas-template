variable "function_name" {
  description = "Lambda function name to attach alarms to."
  type        = string
}

variable "alarm_actions" {
  description = "SNS topic ARNs to notify on alarm state."
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "SNS topic ARNs to notify on OK state."
  type        = list(string)
  default     = []
}

variable "errors_threshold" {
  description = "Error count that triggers the errors alarm."
  type        = number
  default     = 1
}

variable "errors_evaluation_periods" {
  description = "Consecutive periods that must breach threshold before firing."
  type        = number
  default     = 1
}

variable "errors_period_seconds" {
  description = "Metric aggregation period in seconds for the errors alarm."
  type        = number
  default     = 60
}

variable "throttles_threshold" {
  description = "Throttle count that triggers the throttles alarm."
  type        = number
  default     = 1
}

variable "throttles_evaluation_periods" {
  description = "Consecutive periods that must breach threshold before firing."
  type        = number
  default     = 1
}

variable "throttles_period_seconds" {
  description = "Metric aggregation period in seconds for the throttles alarm."
  type        = number
  default     = 60
}

variable "tags" {
  description = "Tags to apply to alarm resources."
  type        = map(string)
  default     = {}
}

