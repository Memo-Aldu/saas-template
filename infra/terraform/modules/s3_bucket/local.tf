locals {
  bucket_tags = merge(var.tags, { Name = var.bucket_name })
}
