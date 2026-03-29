locals {
  tags = merge(var.tags, {
    Stack = "data"
  })
}

module "dynamodb_tables" {
  source   = "../../modules/dynamodb_table"
  for_each = var.dynamodb_tables

  table_name                     = each.value.table_name
  billing_mode                   = try(each.value.billing_mode, "PAY_PER_REQUEST")
  hash_key                       = each.value.hash_key
  range_key                      = try(each.value.range_key, null)
  attributes                     = each.value.attributes
  global_secondary_indexes       = try(each.value.global_secondary_indexes, [])
  local_secondary_indexes        = try(each.value.local_secondary_indexes, [])
  read_capacity                  = try(each.value.read_capacity, 5)
  write_capacity                 = try(each.value.write_capacity, 5)
  ttl_attribute                  = try(each.value.ttl_attribute, null)
  kms_key_arn                    = try(each.value.kms_key_arn, null)
  enable_point_in_time_recovery  = try(each.value.enable_point_in_time_recovery, true)
  enable_deletion_protection     = try(each.value.enable_deletion_protection, false)
  stream_enabled                 = try(each.value.stream_enabled, false)
  stream_view_type               = try(each.value.stream_view_type, "NEW_AND_OLD_IMAGES")
  enable_autoscaling             = try(each.value.enable_autoscaling, false)
  autoscaling_read_max_capacity  = try(each.value.autoscaling_read_max_capacity, 100)
  autoscaling_write_max_capacity = try(each.value.autoscaling_write_max_capacity, 100)
  autoscaling_target_value       = try(each.value.autoscaling_target_value, 70)
  tags                           = local.tags
}

module "s3_buckets" {
  source   = "../../modules/s3_bucket"
  for_each = var.s3_buckets

  bucket_name        = each.value.bucket_name
  force_destroy      = try(each.value.force_destroy, false)
  versioning_enabled = try(each.value.versioning_enabled, true)
  sse_algorithm      = try(each.value.sse_algorithm, "AES256")
  kms_key_id         = try(each.value.kms_key_id, null)
  bucket_key_enabled = try(each.value.bucket_key_enabled, true)
  lifecycle_rules    = try(each.value.lifecycle_rules, [])
  tags               = local.tags
}
