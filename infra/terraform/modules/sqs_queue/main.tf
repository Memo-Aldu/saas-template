resource "aws_sqs_queue" "dlq" {
  count = var.create_dlq ? 1 : 0

  name                      = "${var.name}-dlq"
  message_retention_seconds = var.dlq_message_retention_seconds
  tags                      = var.tags
}

resource "aws_sqs_queue" "this" {
  name                       = var.name
  visibility_timeout_seconds = var.visibility_timeout_seconds
  tags                       = var.tags

  redrive_policy = var.create_dlq ? jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[0].arn
    maxReceiveCount     = var.max_receive_count
  }) : null
}
