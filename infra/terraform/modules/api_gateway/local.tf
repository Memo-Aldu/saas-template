locals {
  api_tags = merge(var.tags, { Name = var.name })
}
