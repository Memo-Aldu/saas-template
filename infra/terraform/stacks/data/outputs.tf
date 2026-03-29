output "dynamodb_table_names" {
  description = "Map of DynamoDB table names by key."
  value       = { for k, t in module.dynamodb_tables : k => t.table_name }
}

output "dynamodb_table_arns" {
  description = "Map of DynamoDB table ARNs by key."
  value       = { for k, t in module.dynamodb_tables : k => t.table_arn }
}

output "s3_bucket_names" {
  description = "Map of S3 bucket names by key."
  value       = { for k, b in module.s3_buckets : k => b.bucket_name }
}

output "s3_bucket_arns" {
  description = "Map of S3 bucket ARNs by key."
  value       = { for k, b in module.s3_buckets : k => b.bucket_arn }
}
