locals {
  merged_tags = merge(
    {
      Project = var.project
      Env     = var.env
    },
    var.tags
  )

  # Cognito email mode
  email_sending_account = var.use_ses ? "DEVELOPER" : "COGNITO_DEFAULT"

  # Derive hosted UI domain value if prefix provided (+ optional suffix)
  computed_domain_prefix = (
    var.cognito_domain_prefix == "" ? "" :
    (
      var.add_random_suffix
      ? "${var.cognito_domain_prefix}-${try(random_id.domain_suffix[0].hex, "000000")}"
      : var.cognito_domain_prefix
    )
  )
}
