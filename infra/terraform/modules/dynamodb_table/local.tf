locals {
  table_tags = merge(var.tags, { Name = var.table_name })
}
