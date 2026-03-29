output "function_arn" {
  description = "Lambda function ARN."
  value       = aws_lambda_function.this.arn
}

output "function_name" {
  description = "Lambda function name."
  value       = aws_lambda_function.this.function_name
}

output "invoke_arn" {
  description = "Lambda invoke ARN (used by API Gateway integrations)."
  value       = aws_lambda_function.this.invoke_arn
}

output "log_group_arn" {
  description = "CloudWatch log group ARN."
  value       = aws_cloudwatch_log_group.this.arn
}

output "artifact_key" {
  description = "S3 key of the uploaded deployment artifact."
  value       = aws_s3_object.artifact.key
}

