variable "name" {
  description = "SQS queue name."
  type        = string
}

variable "visibility_timeout_seconds" {
  description = "Visibility timeout for the main queue."
  type        = number
  default     = 30
}

variable "create_dlq" {
  description = "Whether to create a DLQ."
  type        = bool
  default     = true
}

variable "max_receive_count" {
  description = "Max receives before moving to DLQ."
  type        = number
  default     = 3
}

variable "dlq_message_retention_seconds" {
  description = "Message retention for DLQ."
  type        = number
  default     = 1209600
}

variable "tags" {
  description = "Tags to apply."
  type        = map(string)
  default     = {}
}
