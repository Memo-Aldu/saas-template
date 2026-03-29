locals {
  normalized_integrations = {
    for key, cfg in var.integrations : key => merge(cfg, {
      http_method        = upper(cfg.http_method)
      trimmed_path       = trim(cfg.path, "/")
      full_path          = cfg.path == "/" ? "/" : "/${trim(cfg.path, "/")}"
      path_segments      = cfg.path == "/" ? [] : compact(split("/", trim(cfg.path, "/")))
      resource_key       = cfg.path == "/" ? "" : join("/", compact(split("/", trim(cfg.path, "/"))))
      authorization_type = upper(cfg.authorization_type)
    })
  }

  resource_nodes = flatten([
    for integration in values(local.normalized_integrations) : [
      for idx, segment in integration.path_segments : {
        key        = join("/", slice(integration.path_segments, 0, idx + 1))
        parent_key = idx == 0 ? "" : join("/", slice(integration.path_segments, 0, idx))
        path_part  = segment
      }
    ]
  ])

  grouped_api_resources = {
    for node in local.resource_nodes : node.key => node...
  }

  api_resources = tomap({
    for key, nodes in local.grouped_api_resources : key => nodes[0]
  })

  max_resource_depth = max(concat([0], [
    for resource_key in keys(local.api_resources) : length(split("/", resource_key))
  ])...)

  api_resources_by_depth = {
    for depth in range(1, local.max_resource_depth + 1) : depth => tomap({
      for key, node in local.api_resources : key => node
      if length(split("/", key)) == depth
    })
  }

  cors_resources = tomap({
    for resource_key in distinct([
      for integration in values(local.normalized_integrations) : integration.resource_key
      if integration.cors_enabled && integration.resource_key != ""
      ]) : resource_key => {
      resource_key = resource_key
      allow_methods = join(",", sort(distinct(concat(["OPTIONS"], [
        for integration in values(local.normalized_integrations) : integration.http_method
        if integration.resource_key == resource_key
      ]))))
    }
  })

  throttled_routes = tomap({
    for key, integration in local.normalized_integrations : key => integration
    if integration.throttling != null
  })
}

check "resource_depth_supported" {
  assert {
    condition     = local.max_resource_depth <= 8
    error_message = "API Gateway resource paths deeper than 8 segments are not supported by this module."
  }
}

resource "aws_api_gateway_rest_api" "this" {
  name = var.name
  tags = local.api_tags

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_authorizer" "cognito" {
  count = var.enable_cognito ? 1 : 0

  name            = "${var.name}-cognito"
  rest_api_id     = aws_api_gateway_rest_api.this.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = var.cognito_user_pool_arns
  identity_source = "method.request.header.Authorization"
}

resource "aws_api_gateway_resource" "level_1" {
  for_each = try(local.api_resources_by_depth[1], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_2" {
  for_each = try(local.api_resources_by_depth[2], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_1[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_3" {
  for_each = try(local.api_resources_by_depth[3], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_2[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_4" {
  for_each = try(local.api_resources_by_depth[4], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_3[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_5" {
  for_each = try(local.api_resources_by_depth[5], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_4[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_6" {
  for_each = try(local.api_resources_by_depth[6], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_5[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_7" {
  for_each = try(local.api_resources_by_depth[7], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_6[each.value.parent_key].id
  path_part   = each.value.path_part
}

resource "aws_api_gateway_resource" "level_8" {
  for_each = try(local.api_resources_by_depth[8], {})

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.level_7[each.value.parent_key].id
  path_part   = each.value.path_part
}

locals {
  api_resource_ids = merge(
    { for key, resource in aws_api_gateway_resource.level_1 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_2 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_3 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_4 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_5 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_6 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_7 : key => resource.id },
    { for key, resource in aws_api_gateway_resource.level_8 : key => resource.id },
  )
}

resource "aws_api_gateway_method" "this" {
  for_each = local.normalized_integrations

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = each.value.resource_key == "" ? aws_api_gateway_rest_api.this.root_resource_id : local.api_resource_ids[each.value.resource_key]
  http_method = each.value.http_method
  authorization = (
    each.value.authorization_type == "COGNITO" && var.enable_cognito ? "COGNITO_USER_POOLS" :
    each.value.authorization_type == "AWS_IAM" ? "AWS_IAM" :
    "NONE"
  )
  authorizer_id    = each.value.authorization_type == "COGNITO" && var.enable_cognito ? aws_api_gateway_authorizer.cognito[0].id : null
  api_key_required = each.value.api_key_required
}

resource "aws_api_gateway_integration" "this" {
  for_each = local.normalized_integrations

  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_method.this[each.key].resource_id
  http_method             = aws_api_gateway_method.this[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${each.value.lambda_function_arn}/invocations"
}

resource "aws_api_gateway_method" "cors" {
  for_each = local.cors_resources

  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = local.api_resource_ids[each.value.resource_key]
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors" {
  for_each = local.cors_resources

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_method.cors[each.key].resource_id
  http_method = aws_api_gateway_method.cors[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "cors" {
  for_each = local.cors_resources

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_method.cors[each.key].resource_id
  http_method = aws_api_gateway_method.cors[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "cors" {
  for_each = local.cors_resources

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_method.cors[each.key].resource_id
  http_method = aws_api_gateway_method.cors[each.key].http_method
  status_code = aws_api_gateway_method_response.cors[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'${var.cors_allow_headers}'"
    "method.response.header.Access-Control-Allow-Methods" = "'${each.value.allow_methods}'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.cors_allow_origin}'"
  }
}

resource "aws_api_gateway_gateway_response" "default_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'${var.cors_allow_headers}'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'${var.cors_allow_methods}'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'${var.cors_allow_origin}'"
  }
}

resource "aws_api_gateway_gateway_response" "default_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'${var.cors_allow_headers}'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'${var.cors_allow_methods}'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'${var.cors_allow_origin}'"
  }
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode({
      integrations = local.normalized_integrations
      cors         = local.cors_resources
      cognito      = var.cognito_user_pool_arns
      throttling = {
        burst = var.default_throttling_burst_limit
        rate  = var.default_throttling_rate_limit
      }
    }))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.this,
    aws_api_gateway_integration.cors,
    aws_api_gateway_gateway_response.default_4xx,
    aws_api_gateway_gateway_response.default_5xx,
  ]
}

resource "aws_api_gateway_stage" "this" {
  rest_api_id          = aws_api_gateway_rest_api.this.id
  deployment_id        = aws_api_gateway_deployment.this.id
  stage_name           = var.stage_name
  xray_tracing_enabled = true
  tags                 = local.api_tags

  access_log_settings {
    destination_arn = var.access_log_destination_arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      resourcePath     = "$context.resourcePath"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
      authorizerError  = "$context.authorizer.error"
    })
  }
}

resource "aws_api_gateway_method_settings" "default" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = aws_api_gateway_stage.this.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    logging_level          = "INFO"
    data_trace_enabled     = false
    throttling_burst_limit = var.default_throttling_burst_limit
    throttling_rate_limit  = var.default_throttling_rate_limit
  }
}

resource "aws_api_gateway_method_settings" "route_override" {
  for_each = local.throttled_routes

  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = aws_api_gateway_stage.this.stage_name
  method_path = "${trim(each.value.full_path, "/")}/${each.value.http_method}"

  settings {
    metrics_enabled        = true
    logging_level          = "INFO"
    data_trace_enabled     = false
    throttling_burst_limit = try(each.value.throttling.burst_limit, var.default_throttling_burst_limit)
    throttling_rate_limit  = try(each.value.throttling.rate_limit, var.default_throttling_rate_limit)
  }
}

resource "aws_lambda_permission" "apigw_invoke_lambda" {
  for_each = local.normalized_integrations

  statement_id  = "AllowAPIGatewayInvoke-${substr(md5("${each.key}-${each.value.route_key}"), 0, 16)}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/${each.value.http_method}${each.value.full_path}"
}
