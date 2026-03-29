variable "table_name" {
  description = "DynamoDB table name."
  type        = string
}

variable "billing_mode" {
  description = "Billing mode (PAY_PER_REQUEST or PROVISIONED)."
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "hash_key" {
  description = "Hash key attribute name."
  type        = string
}

variable "range_key" {
  description = "Optional range key attribute name."
  type        = string
  default     = null
}

variable "attributes" {
  description = "Attribute definitions used by table and indexes."
  type = list(object({
    name = string
    type = string
  }))
}

variable "global_secondary_indexes" {
  description = "Global secondary indexes."
  type = list(object({
    name               = string
    hash_key           = string
    range_key          = optional(string)
    projection_type    = string
    non_key_attributes = optional(list(string))
    read_capacity      = optional(number)
    write_capacity     = optional(number)
  }))
  default = []
}

variable "local_secondary_indexes" {
  description = "Local secondary indexes."
  type = list(object({
    name               = string
    range_key          = string
    projection_type    = string
    non_key_attributes = optional(list(string))
  }))
  default = []
}

variable "read_capacity" {
  description = "Read capacity when billing_mode is PROVISIONED."
  type        = number
  default     = 5
}

variable "write_capacity" {
  description = "Write capacity when billing_mode is PROVISIONED."
  type        = number
  default     = 5
}

variable "ttl_attribute" {
  description = "TTL attribute name."
  type        = string
  default     = null
}

variable "kms_key_arn" {
  description = "Optional KMS key ARN for SSE."
  type        = string
  default     = null
}

variable "enable_point_in_time_recovery" {
  description = "Enable point-in-time recovery."
  type        = bool
  default     = true
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection."
  type        = bool
  default     = false
}

variable "stream_enabled" {
  description = "Enable DynamoDB streams."
  type        = bool
  default     = false
}

variable "stream_view_type" {
  description = "Stream view type when streams enabled."
  type        = string
  default     = "NEW_AND_OLD_IMAGES"
}

variable "enable_autoscaling" {
  description = "Enable read/write autoscaling for PROVISIONED billing mode."
  type        = bool
  default     = false
}

variable "autoscaling_read_max_capacity" {
  description = "Max read capacity for autoscaling."
  type        = number
  default     = 100
}

variable "autoscaling_write_max_capacity" {
  description = "Max write capacity for autoscaling."
  type        = number
  default     = 100
}

variable "autoscaling_target_value" {
  description = "Target utilization for autoscaling policies."
  type        = number
  default     = 70
}

variable "tags" {
  description = "Tags to apply."
  type        = map(string)
  default     = {}
}
