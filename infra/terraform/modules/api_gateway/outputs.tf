output "api_endpoint" {
  description = "REST API invoke URL."
  value       = "https://${aws_api_gateway_rest_api.this.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.this.stage_name}"
}

output "api_id" {
  description = "REST API ID."
  value       = aws_api_gateway_rest_api.this.id
}

output "execution_arn" {
  description = "REST API execution ARN."
  value       = aws_api_gateway_rest_api.this.execution_arn
}

output "route_keys" {
  description = "Configured route keys."
  value       = [for _, v in var.integrations : v.route_key]
}
