output "api_endpoint" {
  description = "REST API endpoint."
  value       = module.api_gateway.api_endpoint
}

output "api_id" {
  description = "REST API id."
  value       = module.api_gateway.api_id
}

output "rest_lambda_arns" {
  description = "Map of REST Lambda ARNs by lambda key."
  value       = { for key, lambda in module.rest_lambdas : key => lambda.function_arn }
}

output "worker_lambda_arns" {
  description = "Map of worker Lambda ARNs by lambda key."
  value       = { for key, lambda in module.worker_lambdas : key => lambda.function_arn }
}

output "worker_queue_urls" {
  description = "Map of worker queue URLs by worker key."
  value       = { for key, queue in module.worker_queues : key => queue.queue_url }
}

output "worker_dlq_urls" {
  description = "Map of worker DLQ URLs by worker key."
  value       = { for key, queue in module.worker_queues : key => queue.dlq_url }
}

output "route_keys" {
  description = "Configured API route keys."
  value       = module.api_gateway.route_keys
}

output "lambda_artifacts_bucket_name" {
  description = "Lambda artifacts bucket name."
  value       = var.lambda_artifact_bucket_name
}

output "rest_lambda_arn" {
  description = "Backward-compatible primary REST Lambda ARN."
  value       = try(module.rest_lambdas[var.default_rest_lambda_key].function_arn, null)
}

output "worker_lambda_arn" {
  description = "Backward-compatible primary worker Lambda ARN."
  value       = try(module.worker_lambdas[var.default_worker_lambda_key].function_arn, null)
}

output "worker_queue_url" {
  description = "Backward-compatible primary worker queue URL."
  value       = try(module.worker_queues[var.default_worker_lambda_key].queue_url, null)
}

output "worker_dlq_url" {
  description = "Backward-compatible primary worker DLQ URL."
  value       = try(module.worker_queues[var.default_worker_lambda_key].dlq_url, null)
}
