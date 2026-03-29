# Random suffix for hosted UI domain (optional)
resource "random_id" "domain_suffix" {
  count       = var.cognito_domain_prefix != "" && var.add_random_suffix ? 1 : 0
  byte_length = 3
}

resource "aws_cognito_user_pool" "this" {
  name = var.name

  # username = email
  username_attributes = ["email"]

  auto_verified_attributes = var.email_verification ? ["email"] : []

  # Basic schema
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  email_configuration {
    email_sending_account = local.email_sending_account
    from_email_address    = var.use_ses ? var.ses_from_address : null
    source_arn            = var.use_ses ? var.ses_source_arn : null
  }

  admin_create_user_config {
    allow_admin_create_user_only = !var.allow_self_signup
  }

  password_policy {
    minimum_length    = var.password_min_length
    require_lowercase = var.password_require_lower
    require_numbers   = var.password_require_num
    require_symbols   = var.password_require_symbol
    require_uppercase = var.password_require_upper
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your email for ${var.project}!"
    email_message        = "Your verification code is {####}."
  }

  mfa_configuration = var.mfa_configuration

  lifecycle {
    ignore_changes = [
      schema, # Ignores changes to the entire schema block
    ]
  }

  tags = local.merged_tags
}

# App client for Next.js (PKCE; public client, no secret)
resource "aws_cognito_user_pool_client" "web" {
  name         = var.app_client_name
  user_pool_id = aws_cognito_user_pool.this.id
  depends_on   = [aws_cognito_identity_provider.google, aws_cognito_identity_provider.apple]

  generate_secret = false

  allowed_oauth_flows                  = var.allowed_oauth_flows
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = var.allowed_oauth_scopes
  supported_identity_providers         = distinct(var.supported_identity_providers)

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

resource "aws_cognito_identity_provider" "google" {
  count = try(var.google_identity_provider.enabled, false) ? 1 : 0

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
  provider_details = {
    authorize_scopes = "email openid profile"
    client_id        = var.google_identity_provider.client_id
    client_secret    = var.google_identity_provider.client_secret
  }
  provider_name = "Google"
  provider_type = "Google"
  user_pool_id  = aws_cognito_user_pool.this.id
}

resource "aws_cognito_identity_provider" "apple" {
  count = try(var.apple_identity_provider.enabled, false) ? 1 : 0

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
  provider_details = {
    authorize_scopes = "email name"
    client_id        = var.apple_identity_provider.client_id
    key_id           = var.apple_identity_provider.key_id
    private_key      = var.apple_identity_provider.private_key
    team_id          = var.apple_identity_provider.team_id
  }
  provider_name = "SignInWithApple"
  provider_type = "SignInWithApple"
  user_pool_id  = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_group" "this" {
  for_each = var.groups

  user_pool_id = aws_cognito_user_pool.this.id
  name         = each.key
  description  = try(each.value.description, null)
  precedence   = try(each.value.precedence, null)
  role_arn     = try(each.value.role_arn, null)
}

# Hosted UI domain (simple dev path)
resource "aws_cognito_user_pool_domain" "prefix" {
  count        = local.computed_domain_prefix != "" && var.custom_domain == "" ? 1 : 0
  domain       = local.computed_domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}

# Custom domain (prod path)
resource "aws_cognito_user_pool_domain" "custom" {
  count           = var.custom_domain != "" && var.acm_certificate_arn != "" ? 1 : 0
  domain          = var.custom_domain
  user_pool_id    = aws_cognito_user_pool.this.id
  certificate_arn = var.acm_certificate_arn
}
