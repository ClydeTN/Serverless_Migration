# infrastructure/modules/dynamodb/outputs.tf

# Users Table Outputs
output "users_table_name" {
  description = "Name of the users table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the users table"
  value       = aws_dynamodb_table.users.arn
}

output "users_email_index_name" {
  description = "Name of the email GSI on users table"
  value       = aws_dynamodb_table.users.global_secondary_index[0].name
}

# Projects Table Outputs
output "projects_table_name" {
  description = "Name of the projects table"
  value       = aws_dynamodb_table.projects.name
}

output "projects_table_arn" {
  description = "ARN of the projects table"
  value       = aws_dynamodb_table.projects.arn
}

output "projects_user_id_index_name" {
  description = "Name of the userId GSI on projects table"
  value       = aws_dynamodb_table.projects.global_secondary_index[0].name
}

# Snapshots Table Outputs
output "snapshots_table_name" {
  description = "Name of the snapshots table"
  value       = aws_dynamodb_table.snapshots.name
}

output "snapshots_table_arn" {
  description = "ARN of the snapshots table"
  value       = aws_dynamodb_table.snapshots.arn
}

# Enumerable Data Table Outputs
output "enumerable_data_table_name" {
  description = "Name of the enumerable data table"
  value       = aws_dynamodb_table.enumerable_data.name
}

output "enumerable_data_table_arn" {
  description = "ARN of the enumerable data table"
  value       = aws_dynamodb_table.enumerable_data.arn
}

output "enumerable_data_type_index_name" {
  description = "Name of the type GSI on enumerable data table"
  value       = aws_dynamodb_table.enumerable_data.global_secondary_index[0].name
}

# Orders Table Outputs
output "orders_table_name" {
  description = "Name of the orders table"
  value       = aws_dynamodb_table.orders.name
}

output "orders_table_arn" {
  description = "ARN of the orders table"
  value       = aws_dynamodb_table.orders.arn
}

# Combined Outputs for IAM Policies
output "all_table_arns" {
  description = "List of all DynamoDB table ARNs"
  value = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.projects.arn,
    aws_dynamodb_table.snapshots.arn,
    aws_dynamodb_table.enumerable_data.arn,
    aws_dynamodb_table.orders.arn
  ]
}

output "all_table_names" {
  description = "List of all DynamoDB table names"
  value = [
    aws_dynamodb_table.users.name,
    aws_dynamodb_table.projects.name,
    aws_dynamodb_table.snapshots.name,
    aws_dynamodb_table.enumerable_data.name,
    aws_dynamodb_table.orders.name
  ]
}

# Environment-specific outputs
output "environment" {
  description = "Environment name"
  value       = var.environment
}