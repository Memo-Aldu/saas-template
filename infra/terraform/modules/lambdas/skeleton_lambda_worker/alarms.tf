module "alarms" {
  source = "../alarms"

  function_name = aws_lambda_function.this.function_name

  alarm_actions = var.alarm_actions
  ok_actions    = var.ok_actions

  errors_threshold          = var.errors_threshold
  errors_evaluation_periods = var.errors_evaluation_periods
  errors_period_seconds     = var.errors_period_seconds

  throttles_threshold          = var.throttles_threshold
  throttles_evaluation_periods = var.throttles_evaluation_periods
  throttles_period_seconds     = var.throttles_period_seconds

  tags = local.service_tags
}

resource "aws_cloudwatch_metric_alarm" "queue_depth" {
  count = var.queue_depth_alarm_threshold > 0 ? 1 : 0

  alarm_name          = "${var.function_name}-queue-depth"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.queue_depth_evaluation_periods
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = var.queue_depth_period_seconds
  statistic           = "Maximum"
  threshold           = var.queue_depth_alarm_threshold
  alarm_description   = "SQS queue ${var.queue_name} has a high message backlog."
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  tags                = local.service_tags

  dimensions = {
    QueueName = var.queue_name
  }
}
