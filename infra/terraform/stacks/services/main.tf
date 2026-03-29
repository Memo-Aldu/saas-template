locals {
  prefix        = "${var.project}-${var.environment}"
  api_base_path = "/api/${trim(var.api_version, "/")}"
  tags = merge(var.tags, {
    Stack = "services"
  })

  normalized_rest_lambdas = {
    for key, cfg in var.rest_lambdas : key => {
      handler               = cfg.handler
      artifact_source_path  = abspath("${path.root}/${cfg.artifact_source_path}")
      artifact_key          = cfg.artifact_key
      memory_size           = cfg.memory_size != null ? cfg.memory_size : var.lambda_memory_mb
      timeout               = cfg.timeout != null ? cfg.timeout : var.lambda_timeout_seconds
      environment_variables = cfg.environment_variables != null ? cfg.environment_variables : {}
      dynamodb_table_access = cfg.dynamodb_table_access != null ? cfg.dynamodb_table_access : []
      s3_bucket_access      = cfg.s3_bucket_access != null ? cfg.s3_bucket_access : []
      routes = [
        for route in(cfg.routes != null ? cfg.routes : []) : can(route.route) ? {
          route              = route.route
          authorization_type = upper(try(route.authorization_type, try(route.authorization, "COGNITO")))
          api_key_required   = try(route.api_key_required, false)
          cors_enabled       = try(route.cors_enabled, true)
          throttling         = try(route.throttling, null)
          } : {
          route              = tostring(route)
          authorization_type = "COGNITO"
          api_key_required   = false
          cors_enabled       = true
          throttling         = null
        }
      ]
    }
  }

  normalized_worker_lambdas = {
    for key, cfg in var.worker_lambdas : key => {
      handler               = cfg.handler
      artifact_source_path  = abspath("${path.root}/${cfg.artifact_source_path}")
      artifact_key          = cfg.artifact_key
      memory_size           = cfg.memory_size != null ? cfg.memory_size : var.lambda_memory_mb
      timeout               = cfg.timeout != null ? cfg.timeout : var.worker_timeout_seconds
      environment_variables = cfg.environment_variables != null ? cfg.environment_variables : {}
      dynamodb_table_access = cfg.dynamodb_table_access != null ? cfg.dynamodb_table_access : []
      s3_bucket_access      = cfg.s3_bucket_access != null ? cfg.s3_bucket_access : []
      queue_name            = coalesce(try(cfg.queue.name, null), "${local.prefix}-${key}")
      visibility_timeout_seconds = coalesce(
        try(cfg.queue.visibility_timeout_seconds, null),
        (cfg.timeout != null ? cfg.timeout : var.worker_timeout_seconds) + var.worker_queue_visibility_timeout_offset_seconds
      )
      queue_depth_alarm_threshold     = coalesce(try(cfg.queue.queue_depth_alarm_threshold, null), 0)
      queue_depth_evaluation_periods  = coalesce(try(cfg.queue.queue_depth_evaluation_periods, null), 3)
      queue_depth_period_seconds      = coalesce(try(cfg.queue.queue_depth_period_seconds, null), 60)
      batch_size                      = coalesce(try(cfg.queue.batch_size, null), var.worker_batch_size)
      maximum_batching_window_seconds = coalesce(try(cfg.queue.maximum_batching_window_seconds, null), 5)
      create_dlq                      = coalesce(try(cfg.queue.create_dlq, null), true)
      max_receive_count               = coalesce(try(cfg.queue.max_receive_count, null), 3)
      dlq_message_retention_seconds   = coalesce(try(cfg.queue.dlq_message_retention_seconds, null), 1209600)
    }
  }

  rest_route_bindings = flatten([
    for lambda_key, cfg in local.normalized_rest_lambdas : [
      for route_cfg in cfg.routes : {
        id         = "${lambda_key}:${route_cfg.route}"
        lambda_key = lambda_key
        route_key = route_cfg.route == "$default" ? route_cfg.route : join(" ", [
          upper(split(" ", route_cfg.route)[0]),
          "${local.api_base_path}${split(" ", route_cfg.route)[1]}"
        ])
        http_method        = route_cfg.route == "$default" ? "ANY" : upper(split(" ", route_cfg.route)[0])
        path               = route_cfg.route == "$default" ? local.api_base_path : "${local.api_base_path}${split(" ", route_cfg.route)[1]}"
        authorization_type = route_cfg.authorization_type
        api_key_required   = route_cfg.api_key_required
        cors_enabled       = route_cfg.cors_enabled
        throttling         = route_cfg.throttling
      }
    ]
  ])

  route_keys = [for binding in local.rest_route_bindings : binding.route_key]
  protected_route_keys = [
    for binding in local.rest_route_bindings : binding.route_key
    if binding.authorization_type != "NONE"
  ]

  api_integrations = {
    for binding in local.rest_route_bindings : binding.id => {
      route_key            = binding.route_key
      http_method          = binding.http_method
      path                 = binding.path
      authorization_type   = binding.authorization_type
      api_key_required     = binding.api_key_required
      cors_enabled         = binding.cors_enabled
      throttling           = binding.throttling
      lambda_function_arn  = module.rest_lambdas[binding.lambda_key].function_arn
      lambda_function_name = module.rest_lambdas[binding.lambda_key].function_name
    }
  }

  referenced_table_keys = distinct(flatten(concat(
    [for _, cfg in local.normalized_rest_lambdas : cfg.dynamodb_table_access],
    [for _, cfg in local.normalized_worker_lambdas : cfg.dynamodb_table_access]
  )))

  referenced_bucket_keys = distinct(flatten(concat(
    [for _, cfg in local.normalized_rest_lambdas : cfg.s3_bucket_access],
    [for _, cfg in local.normalized_worker_lambdas : cfg.s3_bucket_access]
  )))

  missing_table_keys  = [for key in local.referenced_table_keys : key if !contains(keys(var.dynamodb_tables), key)]
  missing_bucket_keys = [for key in local.referenced_bucket_keys : key if !contains(keys(var.s3_buckets), key)]
}

check "unique_api_routes" {
  assert {
    condition     = length(local.route_keys) == length(distinct(local.route_keys))
    error_message = "Duplicate API route keys detected in rest_lambdas routes."
  }
}

check "route_count_non_zero" {
  assert {
    condition     = length(local.api_integrations) > 0
    error_message = "At least one API route must be defined via rest_lambdas[*].routes."
  }
}

check "cognito_available_for_protected_routes" {
  assert {
    condition = length([
      for binding in local.rest_route_bindings : binding.route_key
      if binding.authorization_type == "COGNITO"
    ]) == 0 || (var.enable_cognito && var.cognito_user_pool_arn != null)
    error_message = "COGNITO API routes require enable_cognito=true and a Cognito user pool ARN."
  }
}

check "supported_authorization_types" {
  assert {
    condition = alltrue([
      for binding in local.rest_route_bindings :
      contains(["NONE", "COGNITO", "AWS_IAM"], binding.authorization_type)
    ])
    error_message = "REST API routes support only authorization_type values NONE, COGNITO, or AWS_IAM."
  }
}

check "known_table_keys" {
  assert {
    condition     = length(local.missing_table_keys) == 0
    error_message = "Unknown DynamoDB table keys referenced by lambdas."
  }
}

check "known_bucket_keys" {
  assert {
    condition     = length(local.missing_bucket_keys) == 0
    error_message = "Unknown S3 bucket keys referenced by lambdas."
  }
}

module "rest_lambdas" {
  source   = "../../modules/lambdas/skeleton_lambda_rest"
  for_each = local.normalized_rest_lambdas

  function_name        = "${local.prefix}-${each.key}"
  managed_policy_arns  = var.lambda_managed_policy_arns
  handler              = each.value.handler
  runtime              = var.lambda_runtime
  memory_size          = each.value.memory_size
  timeout              = each.value.timeout
  artifact_bucket_name = var.lambda_artifact_bucket_name
  artifact_key         = each.value.artifact_key
  artifact_source_path = each.value.artifact_source_path
  log_retention_days   = var.log_retention_days
  alarm_actions        = var.alarm_actions
  ok_actions           = var.ok_actions
  tags                 = local.tags

  dynamodb_table_arns = [
    for key in each.value.dynamodb_table_access : var.dynamodb_tables[key].arn
    if contains(keys(var.dynamodb_tables), key)
  ]
  s3_bucket_arns = [
    for key in each.value.s3_bucket_access : var.s3_buckets[key].arn
    if contains(keys(var.s3_buckets), key)
  ]

  environment_variables = merge(var.common_lambda_environment, each.value.environment_variables, {
    ENVIRONMENT             = var.environment
    POWERTOOLS_SERVICE_NAME = "${local.prefix}-${each.key}"
    SERVICE_VERSION         = var.service_version
    POWERTOOLS_LOG_LEVEL    = var.environment == "prod" ? "WARNING" : "INFO"
    APP_AWS_REGION          = var.aws_region
    CORS_ALLOW_ORIGIN       = var.cors_allow_origin
  })
}

module "worker_queues" {
  source   = "../../modules/sqs_queue"
  for_each = local.normalized_worker_lambdas

  name                          = each.value.queue_name
  visibility_timeout_seconds    = each.value.visibility_timeout_seconds
  create_dlq                    = each.value.create_dlq
  max_receive_count             = each.value.max_receive_count
  dlq_message_retention_seconds = each.value.dlq_message_retention_seconds
  tags                          = local.tags
}

module "worker_lambdas" {
  source   = "../../modules/lambdas/skeleton_lambda_worker"
  for_each = local.normalized_worker_lambdas

  function_name        = "${local.prefix}-${each.key}"
  managed_policy_arns  = var.lambda_managed_policy_arns
  handler              = each.value.handler
  runtime              = var.lambda_runtime
  memory_size          = each.value.memory_size
  timeout              = each.value.timeout
  artifact_bucket_name = var.lambda_artifact_bucket_name
  artifact_key         = each.value.artifact_key
  artifact_source_path = each.value.artifact_source_path
  log_retention_days   = var.log_retention_days
  alarm_actions        = var.alarm_actions
  ok_actions           = var.ok_actions
  tags                 = local.tags

  dynamodb_table_arns = [
    for key in each.value.dynamodb_table_access : var.dynamodb_tables[key].arn
    if contains(keys(var.dynamodb_tables), key)
  ]
  s3_bucket_arns = [
    for key in each.value.s3_bucket_access : var.s3_buckets[key].arn
    if contains(keys(var.s3_buckets), key)
  ]

  queue_arn                       = module.worker_queues[each.key].queue_arn
  queue_url                       = module.worker_queues[each.key].queue_url
  queue_name                      = module.worker_queues[each.key].queue_name
  dlq_arn                         = module.worker_queues[each.key].dlq_arn
  dlq_url                         = module.worker_queues[each.key].dlq_url
  queue_depth_alarm_threshold     = each.value.queue_depth_alarm_threshold
  queue_depth_evaluation_periods  = each.value.queue_depth_evaluation_periods
  queue_depth_period_seconds      = each.value.queue_depth_period_seconds
  batch_size                      = each.value.batch_size
  maximum_batching_window_seconds = each.value.maximum_batching_window_seconds

  environment_variables = merge(var.common_lambda_environment, each.value.environment_variables, {
    ENVIRONMENT             = var.environment
    POWERTOOLS_SERVICE_NAME = "${local.prefix}-${each.key}"
    SERVICE_VERSION         = var.service_version
    POWERTOOLS_LOG_LEVEL    = var.environment == "prod" ? "WARNING" : "INFO"
    APP_AWS_REGION          = var.aws_region
    CORS_ALLOW_ORIGIN       = var.cors_allow_origin
  })
}

resource "aws_cloudwatch_log_group" "api_access" {
  name              = "/aws/apigateway/${local.prefix}-api"
  retention_in_days = var.log_retention_days
  tags              = local.tags
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  name                           = "${local.prefix}-api"
  aws_region                     = var.aws_region
  stage_name                     = var.environment
  enable_cognito                 = var.enable_cognito
  cognito_user_pool_arns         = var.cognito_user_pool_arn != null ? [var.cognito_user_pool_arn] : []
  cors_allow_origin              = var.cors_allow_origin
  cors_allow_headers             = var.cors_allow_headers
  cors_allow_methods             = var.cors_allow_methods
  access_log_destination_arn     = aws_cloudwatch_log_group.api_access.arn
  default_throttling_burst_limit = var.api_stage_throttling_burst_limit
  default_throttling_rate_limit  = var.api_stage_throttling_rate_limit
  integrations                   = local.api_integrations
  tags                           = local.tags
}
