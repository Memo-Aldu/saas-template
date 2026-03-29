output "cognito_user_pool_id" {
  description = "Cognito user pool ID if enabled."
  value       = var.enable_cognito ? module.cognito[0].user_pool_id : null
}

output "cognito_user_pool_arn" {
  description = "Cognito user pool ARN if enabled."
  value       = var.enable_cognito ? module.cognito[0].user_pool_arn : null
}

output "cognito_user_pool_client_id" {
  description = "Cognito user pool client ID if enabled."
  value       = var.enable_cognito ? module.cognito[0].app_client_id : null
}

output "cognito_hosted_ui_domain" {
  description = "Cognito hosted UI domain if enabled."
  value       = var.enable_cognito ? module.cognito[0].hosted_ui_domain : null
}

output "cognito_user_pool_domain" {
  description = "Cognito user pool domain if enabled."
  value       = var.enable_cognito ? module.cognito[0].user_pool_domain : null
}

output "cognito_user_pool_provider_url" {
  description = "Cognito user pool provider URL if enabled."
  value       = var.enable_cognito ? module.cognito[0].user_pool_provider_url : null
}

output "cognito_user_pool_client_secret" {
  description = "Cognito user pool client secret if enabled."
  value       = var.enable_cognito ? module.cognito[0].app_client_secret : null
}

output "cognito_user_pool_client_name" {
  description = "Cognito user pool client name if enabled."
  value       = var.enable_cognito ? module.cognito[0].app_client_name : null
}
