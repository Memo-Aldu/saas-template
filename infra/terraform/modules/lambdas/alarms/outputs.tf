output "errors_alarm_arn" {
  description = "ARN of the Lambda errors CloudWatch alarm."
  value       = aws_cloudwatch_metric_alarm.errors.arn
}

output "throttles_alarm_arn" {
  description = "ARN of the Lambda throttles CloudWatch alarm."
  value       = aws_cloudwatch_metric_alarm.throttles.arn
}

