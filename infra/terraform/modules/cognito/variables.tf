variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "saas-template"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "stg", "prod"], var.env)
    error_message = "Environment must be dev, stg, or prod"
  }
}

variable "name" {
  description = "Name of the Cognito User Pool"
  type        = string
  validation {
    condition     = length(var.name) >= 3 && length(var.name) <= 128
    error_message = "Name must be between 3 and 128 characters."
  }
}

variable "email_verification" {
  description = "Whether to require email verification for new users"
  type        = bool
  default     = true
}

variable "allow_self_signup" {
  description = "Allow users to sign up themselves"
  type        = bool
  default     = true
}

variable "mfa_configuration" {
  description = "OFF|ON|OPTIONAL"
  type        = string
  default     = "OFF"
  validation {
    condition     = contains(["OFF", "ON", "OPTIONAL"], var.mfa_configuration)
    error_message = "MFA configuration must be OFF, ON, or OPTIONAL."
  }
}


variable "password_min_length" {
  description = "Minimum password length"
  type        = number
  default     = 12
  validation {
    condition     = var.password_min_length >= 8
    error_message = "Minimum password length must be at least 8 characters."
  }
}

variable "password_require_upper" {
  description = "Whether to require at least one uppercase character in the password"
  type        = bool
  default     = true
  validation {
    condition     = var.password_require_upper == true || var.password_require_lower == true
    error_message = "Must require either upper or lower case characters."
  }
}

variable "password_require_lower" {
  description = "Whether to require at least one lowercase character in the password"
  type        = bool
  default     = true
}

variable "password_require_num" {
  description = "Whether to require at least one number in the password"
  type        = bool
  default     = true
}

variable "password_require_symbol" {
  description = "Whether to require at least one symbol in the password"
  type        = bool
  default     = false
  validation {
    condition     = var.password_require_symbol == true || var.password_require_num == true
    error_message = "Must require either numbers or symbols."
  }
}

variable "use_ses" {
  description = "Use SES for emails"
  type        = bool
  default     = false
  validation {
    condition     = (!var.use_ses) || contains(["stg", "prod"], var.env)
    error_message = "SES can only be enabled in 'stg' or 'prod' (not 'dev')."
  }
}

variable "ses_from_address" {
  description = "Verified SES 'From' address"
  type        = string
  default     = ""
}

variable "ses_source_arn" {
  description = "SES identity ARN"
  type        = string
  default     = ""
}

# App client (for Next.js)
variable "app_client_name" {
  description = "Name of the app client (for Next.js)"
  type        = string
  default     = "web-app"

  validation {
    condition     = length(var.app_client_name) >= 1 && length(var.app_client_name) <= 128
    error_message = "Name must be between 1 and 128 characters."
  }
}

variable "callback_urls" {
  description = "Callback URLs for the app client (for Next.js)"
  type        = list(string)
  default     = ["http://localhost:3000/api/auth/callback/cognito"]
  validation {
    condition     = length(var.callback_urls) > 0
    error_message = "At least one callback URL is required."
  }
}

variable "logout_urls" {
  description = "Logout URLs for the app client (for Next.js)"
  type        = list(string)
  default     = ["http://localhost:3000"]
  validation {
    condition     = length(var.logout_urls) > 0
    error_message = "At least one logout URL is required."
  }
}

variable "allowed_oauth_flows" {
  description = "Allowed OAuth flows for the app client (for Next.js)"
  type        = list(string)
  default     = ["code"]
  validation {
    condition     = contains(var.allowed_oauth_flows, "code")
    error_message = "OAuth flow 'code' is required for PKCE."
  }
}

variable "allowed_oauth_scopes" {
  description = "Allowed OAuth scopes for the app client (for Next.js)"
  type        = list(string)
  default     = ["email", "openid", "profile"]
  validation {
    condition     = contains(var.allowed_oauth_scopes, "email") && contains(var.allowed_oauth_scopes, "openid") && contains(var.allowed_oauth_scopes, "profile")
    error_message = "Scopes 'email', 'openid', and 'profile' are required."
  }
}

variable "supported_identity_providers" {
  description = "Identity providers enabled on the Cognito app client."
  type        = list(string)
  default     = ["COGNITO"]
  validation {
    condition = length([
      for provider in var.supported_identity_providers :
      provider
      if contains(["COGNITO", "Google", "SignInWithApple"], provider)
    ]) == length(var.supported_identity_providers)
    error_message = "Supported identity providers must be COGNITO, Google, and/or SignInWithApple."
  }
}

variable "google_identity_provider" {
  description = "Optional Google identity provider configuration."
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

variable "apple_identity_provider" {
  description = "Optional Apple identity provider configuration."
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

variable "groups" {
  description = "Cognito user pool groups keyed by group name."
  type = map(object({
    description = optional(string)
    precedence  = optional(number)
    role_arn    = optional(string)
  }))
  default = {}
}

# Optional custom domain (prod).
variable "cognito_domain_prefix" {
  description = "Custom domain prefix for Cognito (leave empty to skip)"
  type        = string
  default     = ""
}

variable "add_random_suffix" {
  description = "Append a short random hex to the domain prefix"
  type        = bool
  default     = true
  validation {
    condition     = !var.add_random_suffix || var.cognito_domain_prefix != ""
    error_message = "Random suffix can only be added if a custom domain prefix is provided."
  }
}

# Optional custom domain (prod).
variable "custom_domain" {
  description = "Custom domain name (e.g., auth.example.com)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the custom domain"
  type        = string
  default     = ""
}

# Common tags
variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
