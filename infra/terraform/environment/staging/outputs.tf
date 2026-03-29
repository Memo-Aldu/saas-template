output "api_endpoint" {
  description = "REST API endpoint for staging."
  value       = module.services.api_endpoint
}

output "rest_lambda_arn" {
  description = "Primary REST Lambda ARN for staging."
  value       = module.services.rest_lambda_arn
}

output "worker_lambda_arn" {
  description = "Primary worker Lambda ARN for staging."
  value       = module.services.worker_lambda_arn
}

output "worker_queue_url" {
  description = "Primary worker queue URL for staging."
  value       = module.services.worker_queue_url
}

output "rest_lambda_arns" {
  description = "All REST Lambda ARNs for staging keyed by lambda key."
  value       = module.services.rest_lambda_arns
}

output "worker_lambda_arns" {
  description = "All worker Lambda ARNs for staging keyed by lambda key."
  value       = module.services.worker_lambda_arns
}

output "worker_queue_urls" {
  description = "All worker queue URLs for staging keyed by worker key."
  value       = module.services.worker_queue_urls
}

output "data_bucket_name" {
  description = "Data bucket name for staging."
  value       = try(module.data.s3_bucket_names["primary"], null)
}

output "data_table_name" {
  description = "Data table name for staging."
  value       = try(module.data.dynamodb_table_names["app"], null)
}

output "cognito_user_pool_id" {
  description = "Cognito user pool id for staging."
  value       = module.core.cognito_user_pool_id
}

output "lambda_artifacts_bucket_name" {
  description = "Lambda artifacts bucket for staging."
  value       = try(module.data.s3_bucket_names["artifacts"], null)
}
