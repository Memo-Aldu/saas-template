variable "dynamodb_tables" {
  description = "Map of DynamoDB tables to create."
  type = map(object({
    table_name   = string
    billing_mode = optional(string)
    hash_key     = string
    range_key    = optional(string)
    attributes   = list(object({ name = string, type = string }))
    global_secondary_indexes = optional(list(object({
      name               = string
      hash_key           = string
      range_key          = optional(string)
      projection_type    = string
      non_key_attributes = optional(list(string))
      read_capacity      = optional(number)
      write_capacity     = optional(number)
    })))
    local_secondary_indexes = optional(list(object({
      name               = string
      range_key          = string
      projection_type    = string
      non_key_attributes = optional(list(string))
    })))
    read_capacity                  = optional(number)
    write_capacity                 = optional(number)
    ttl_attribute                  = optional(string)
    kms_key_arn                    = optional(string)
    enable_point_in_time_recovery  = optional(bool)
    enable_deletion_protection     = optional(bool)
    stream_enabled                 = optional(bool)
    stream_view_type               = optional(string)
    enable_autoscaling             = optional(bool)
    autoscaling_read_max_capacity  = optional(number)
    autoscaling_write_max_capacity = optional(number)
    autoscaling_target_value       = optional(number)
  }))
}

variable "s3_buckets" {
  description = "Map of S3 buckets to create."
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
}

variable "tags" {
  description = "Additional tags."
  type        = map(string)
  default     = {}
}
