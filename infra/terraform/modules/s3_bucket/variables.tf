variable "bucket_name" {
  description = "S3 bucket name."
  type        = string
}

variable "force_destroy" {
  description = "Whether to force destroy the bucket and all objects."
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable bucket versioning."
  type        = bool
  default     = true
}

variable "sse_algorithm" {
  description = "SSE algorithm (AES256 or aws:kms)."
  type        = string
  default     = "AES256"
}

variable "kms_key_id" {
  description = "Optional KMS key id/arn when using aws:kms."
  type        = string
  default     = null
}

variable "bucket_key_enabled" {
  description = "Enable S3 bucket key for KMS encryption."
  type        = bool
  default     = true
}

variable "lifecycle_rules" {
  description = "Lifecycle rules for the bucket."
  type = list(object({
    id                                     = string
    enabled                                = bool
    prefix                                 = optional(string)
    expiration_days                        = optional(number)
    noncurrent_version_expiration_days     = optional(number)
    abort_incomplete_multipart_upload_days = optional(number)
  }))
  default = []
}

variable "tags" {
  description = "Tags to apply."
  type        = map(string)
  default     = {}
}
