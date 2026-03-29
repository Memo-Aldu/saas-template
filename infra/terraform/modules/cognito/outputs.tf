output "user_pool_id" {
  value       = aws_cognito_user_pool.this.id
  description = "Cognito User Pool ID"
}

output "user_pool_arn" {
  value       = aws_cognito_user_pool.this.arn
  description = "Cognito User Pool ARN"
}

output "user_pool_region" {
  value       = var.region
  description = "AWS region for the pool"
}

output "app_client_id" {
  value       = aws_cognito_user_pool_client.web.id
  description = "App client ID (public; PKCE)"
}

output "hosted_ui_domain" {
  value = coalesce(
    try(aws_cognito_user_pool_domain.custom[0].domain, null),
    try(aws_cognito_user_pool_domain.prefix[0].domain, null)
  )
  description = "Cognito hosted UI domain (custom or generated prefix)"
}

output "user_pool_domain" {
  value = coalesce(
    try(aws_cognito_user_pool_domain.custom[0].domain, null),
    try(aws_cognito_user_pool_domain.prefix[0].domain, null)
  )
  description = "Cognito user pool hosted UI domain."
}

output "user_pool_provider_url" {
  value       = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.this.id}"
  description = "Cognito user pool provider URL."
}

output "app_client_secret" {
  value       = null
  description = "Cognito app client secret. Always null for this public PKCE client."
}

output "app_client_name" {
  value       = var.app_client_name
  description = "Cognito app client name."
}
