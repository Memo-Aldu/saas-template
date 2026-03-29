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

