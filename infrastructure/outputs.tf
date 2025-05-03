
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    projects = module.dynamodb.projects_table_name
    snapshots = module.dynamodb.snapshots_table_name
    enumerable = module.dynamodb.enumerable_data_table_name
    orders = module.dynamodb.orders_table_name
  }
}

output "s3_bucket" {
  description = "S3 bucket name"
  value       = module.s3.bucket_name
}