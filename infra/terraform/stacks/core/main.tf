locals {
  tags = merge(var.tags, {
    Stack = "core"
  })

  cognito_env = var.environment == "staging" ? "stg" : var.environment
}

module "cognito" {
  source = "../../modules/cognito"
  count  = var.enable_cognito ? 1 : 0

  region                       = var.region
  project                      = var.project
  env                          = local.cognito_env
  name                         = var.cognito_user_pool_name
  app_client_name              = var.cognito_user_pool_client_name
  groups                       = var.cognito_groups
  callback_urls                = var.cognito_callback_urls
  logout_urls                  = var.cognito_logout_urls
  supported_identity_providers = var.cognito_supported_identity_providers
  google_identity_provider     = var.cognito_google_identity_provider
  apple_identity_provider      = var.cognito_apple_identity_provider
  cognito_domain_prefix        = var.cognito_domain_prefix != null ? var.cognito_domain_prefix : ""
  add_random_suffix            = var.cognito_add_random_suffix
  custom_domain                = var.cognito_custom_domain != null ? var.cognito_custom_domain : ""
  acm_certificate_arn          = var.cognito_custom_domain_certificate_arn != null ? var.cognito_custom_domain_certificate_arn : ""
  use_ses                      = var.cognito_use_ses
  ses_from_address             = var.cognito_ses_from_address != null ? var.cognito_ses_from_address : ""
  ses_source_arn               = var.cognito_ses_source_arn != null ? var.cognito_ses_source_arn : ""
  tags                         = local.tags
}
