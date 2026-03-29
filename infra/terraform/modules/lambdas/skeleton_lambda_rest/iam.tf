data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

locals {
  dynamodb_resource_arns = concat(
    var.dynamodb_table_arns,
    [for arn in var.dynamodb_table_arns : "${arn}/index/*"]
  )
}

resource "aws_iam_role" "execution" {
  name               = "${var.function_name}-exec"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags               = local.service_tags
}

resource "aws_iam_role_policy_attachment" "managed" {
  for_each = toset(var.managed_policy_arns)

  role       = aws_iam_role.execution.name
  policy_arn = each.value
}

# Least-privilege data access policy scoped to exactly the tables and buckets
resource "aws_iam_role_policy" "data_access" {
  count = length(var.dynamodb_table_arns) + length(var.s3_bucket_arns) > 0 ? 1 : 0

  name = "${var.function_name}-data-access"
  role = aws_iam_role.execution.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      length(var.dynamodb_table_arns) > 0 ? [
        {
          Sid    = "DynamoDBAccess"
          Effect = "Allow"
          Action = [
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:ConditionCheckItem",
            "dynamodb:DescribeTable",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
            "dynamodb:Scan",
          ]
          Resource = local.dynamodb_resource_arns
        }
      ] : [],
      length(var.s3_bucket_arns) > 0 ? [
        {
          Sid      = "S3ListBuckets"
          Effect   = "Allow"
          Action   = ["s3:ListBucket"]
          Resource = var.s3_bucket_arns
        },
        {
          Sid    = "S3ObjectAccess"
          Effect = "Allow"
          Action = [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
          ]
          Resource = [for arn in var.s3_bucket_arns : "${arn}/*"]
        },
      ] : []
    )
  })
}
