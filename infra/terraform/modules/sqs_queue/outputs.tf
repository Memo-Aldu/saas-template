output "queue_arn" {
  description = "Main queue ARN."
  value       = aws_sqs_queue.this.arn
}

output "queue_url" {
  description = "Main queue URL."
  value       = aws_sqs_queue.this.url
}

output "queue_name" {
  description = "Main queue name."
  value       = aws_sqs_queue.this.name
}

output "dlq_arn" {
  description = "DLQ ARN if created."
  value       = var.create_dlq ? aws_sqs_queue.dlq[0].arn : null
}

output "dlq_url" {
  description = "DLQ URL if created."
  value       = var.create_dlq ? aws_sqs_queue.dlq[0].url : null
}
