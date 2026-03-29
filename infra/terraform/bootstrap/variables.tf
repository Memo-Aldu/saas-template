variable "project" {
  type    = string
  default = "saas-template"
}
variable "state_bucket_name" {
  type    = string
  default = "saas-template-tfstate-001"
  validation {
    condition     = can(regex("^[a-z0-9.-]{3,63}$", var.state_bucket_name))
    error_message = "state_bucket_name must be a valid S3 bucket name."
  }
}
variable "lock_table_name" {
  type    = string
  default = "saas-template-tf-locks"
  validation {
    condition     = length(var.lock_table_name) >= 3
    error_message = "lock_table_name must be at least 3 characters."
  }
}
