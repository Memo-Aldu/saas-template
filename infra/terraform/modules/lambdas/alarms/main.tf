resource "aws_cloudwatch_metric_alarm" "errors" {
  alarm_name          = "${var.function_name}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.errors_evaluation_periods
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = var.errors_period_seconds
  statistic           = "Sum"
  threshold           = var.errors_threshold
  alarm_description   = "Lambda ${var.function_name} error rate breached threshold."
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  tags                = var.tags

  dimensions = {
    FunctionName = var.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "throttles" {
  alarm_name          = "${var.function_name}-throttles"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.throttles_evaluation_periods
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = var.throttles_period_seconds
  statistic           = "Sum"
  threshold           = var.throttles_threshold
  alarm_description   = "Lambda ${var.function_name} throttle rate breached threshold."
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  tags                = var.tags

  dimensions = {
    FunctionName = var.function_name
  }
}

