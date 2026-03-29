variable "project" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Environment name."
  type        = string
}

variable "region" {
  description = "AWS region."
  type        = string
}

variable "enable_cognito" {
  description = "Whether to provision Cognito in the core stack."
  type        = bool
  default     = true
}

variable "cognito_user_pool_name" {
  description = "Cognito user pool name."
  type        = string
}

variable "cognito_user_pool_client_name" {
  description = "Cognito user pool client name."
  type        = string
}

variable "cognito_groups" {
  description = "Cognito user pool groups keyed by group name."
  type = map(object({
    description = optional(string)
    precedence  = optional(number)
    role_arn    = optional(string)
  }))
  default = {}
}

variable "cognito_callback_urls" {
  description = "Cognito callback URLs."
  type        = list(string)
  default     = ["http://localhost:3000/api/auth/callback/cognito"]
}

variable "cognito_logout_urls" {
  description = "Cognito logout URLs."
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "cognito_supported_identity_providers" {
  description = "Cognito identity providers enabled on the app client."
  type        = list(string)
  default     = ["COGNITO"]
}

variable "cognito_google_identity_provider" {
  description = "Optional Google identity provider configuration for Cognito."
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
  description = "Optional Apple identity provider configuration for Cognito."
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

variable "cognito_domain_prefix" {
  description = "Optional Cognito hosted UI domain prefix."
  type        = string
  default     = null
}

variable "cognito_add_random_suffix" {
  description = "Whether to append random suffix to domain prefix."
  type        = bool
  default     = true
}

variable "cognito_custom_domain" {
  description = "Optional custom Cognito domain."
  type        = string
  default     = null
}

variable "cognito_custom_domain_certificate_arn" {
  description = "Optional ACM certificate ARN for custom domain."
  type        = string
  default     = null
}

variable "cognito_use_ses" {
  description = "Use SES for Cognito emails."
  type        = bool
  default     = false
}

variable "cognito_ses_from_address" {
  description = "SES from address for Cognito emails."
  type        = string
  default     = null
}

variable "cognito_ses_source_arn" {
  description = "SES source arn for Cognito emails."
  type        = string
  default     = null
}

variable "tags" {
  description = "Additional tags."
  type        = map(string)
  default     = {}
}
