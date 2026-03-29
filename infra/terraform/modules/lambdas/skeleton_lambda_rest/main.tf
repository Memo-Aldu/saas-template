# Upload the deployment zip to the shared artifacts bucket.
resource "aws_s3_object" "artifact" {
  bucket = var.artifact_bucket_name
  key    = var.artifact_key
  source = var.artifact_source_path
  etag   = filemd5(var.artifact_source_path)
  tags   = local.service_tags
}

# Pre-create the log group so retention is enforced from the first invocation.
resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
  tags              = local.service_tags
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = aws_iam_role.execution.arn
  handler       = var.handler
  runtime       = var.runtime
  memory_size   = var.memory_size
  timeout       = var.timeout

  s3_bucket         = var.artifact_bucket_name
  s3_key            = aws_s3_object.artifact.key
  s3_object_version = aws_s3_object.artifact.version_id
  source_code_hash  = filebase64sha256(var.artifact_source_path)

  tags = local.service_tags

  environment {
    variables = var.environment_variables
  }

  tracing_config {
    mode = var.tracing_mode
  }

  depends_on = [aws_cloudwatch_log_group.this, aws_iam_role_policy_attachment.managed]
}
