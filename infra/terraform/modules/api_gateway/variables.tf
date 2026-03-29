variable "name" {
  description = "REST API name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for API Gateway integration URIs."
  type        = string
}

variable "enable_cognito" {
  description = "Whether Cognito authorizers should be attached to protected routes."
  type        = bool
  default     = false
}

variable "cognito_user_pool_arns" {
  description = "Cognito user pool ARNs used by the API authorizer."
  type        = list(string)
  default     = []
}

variable "cors_allow_origin" {
  description = "Allowed CORS origin."
  type        = string
  default     = "*"
}

variable "cors_allow_headers" {
  description = "Allowed CORS headers."
  type        = string
  default     = "Content-Type,Authorization,X-Correlation-Id"
}

variable "cors_allow_methods" {
  description = "Allowed CORS methods."
  type        = string
  default     = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
}

variable "integrations" {
  description = "Map of API routes to Lambda integrations."
  type = map(object({
    route_key          = string
    http_method        = string
    path               = string
    authorization_type = string
    api_key_required   = bool
    cors_enabled       = bool
    throttling = optional(object({
      burst_limit = optional(number)
      rate_limit  = optional(number)
    }))
    lambda_function_arn  = string
    lambda_function_name = string
  }))
}

variable "access_log_destination_arn" {
  description = "CloudWatch log group ARN for API access logs."
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name."
  type        = string
}

variable "default_throttling_burst_limit" {
  description = "Default stage throttle burst limit."
  type        = number
  default     = 100
}

variable "default_throttling_rate_limit" {
  description = "Default stage throttle rate limit."
  type        = number
  default     = 50
}

variable "tags" {
  description = "Tags to apply."
  type        = map(string)
  default     = {}
}
