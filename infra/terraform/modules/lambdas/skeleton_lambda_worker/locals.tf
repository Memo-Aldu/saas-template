locals {
  service_tags = merge(var.tags, { Name = var.function_name })
}
