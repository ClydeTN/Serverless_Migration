variable "dynamodb_table_users" {
  description = "DynamoDB table name for users"
  type        = string
}

variable "dynamodb_table_users_arn" {
  description = "DynamoDB table ARN for users"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "dynamodb_table_projects" {
  description = "DynamoDB table name for projects"
  type        = string
}

variable "dynamodb_table_snapshots" {
  description = "DynamoDB table name for snapshots"
  type        = string
}

variable "dynamodb_table_enumerable" {
  description = "DynamoDB table name for enumerable data"
  type        = string
}

variable "dynamodb_table_orders" {
  description = "DynamoDB table name for orders"
  type        = string
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
}

variable "dynamodb_table_projects_arn" {
  description = "DynamoDB table ARN for projects"
  type        = string
}

variable "dynamodb_table_snapshots_arn" {
  description = "DynamoDB table ARN for snapshots"
  type        = string
}

variable "dynamodb_table_enumerable_arn" {
  description = "DynamoDB table ARN for enumerable data"
  type        = string
}

variable "dynamodb_table_orders_arn" {
  description = "DynamoDB table ARN for orders"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
} 