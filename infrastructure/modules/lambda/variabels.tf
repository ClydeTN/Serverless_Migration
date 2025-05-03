# infrastructure/modules/lambda/variables.tf

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "dynamodb_table_projects" {
  description = "Name of the projects DynamoDB table"
  type        = string
}

variable "dynamodb_table_snapshots" {
  description = "Name of the snapshots DynamoDB table"
  type        = string
}

variable "dynamodb_table_enumerable" {
  description = "Name of the enumerable data DynamoDB table"
  type        = string
}

variable "dynamodb_table_orders" {
  description = "Name of the orders DynamoDB table"
  type        = string
}

variable "dynamodb_table_projects_arn" {
  description = "ARN of the projects DynamoDB table"
  type        = string
}

variable "dynamodb_table_snapshots_arn" {
  description = "ARN of the snapshots DynamoDB table"
  type        = string
}

variable "dynamodb_table_enumerable_arn" {
  description = "ARN of the enumerable data DynamoDB table"
  type        = string
}

variable "dynamodb_table_orders_arn" {
  description = "ARN of the orders DynamoDB table"
  type        = string
}

variable "s3_bucket" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "dynamodb_table_templates" {
  description = "Name of the templates DynamoDB table"
  type        = string
}

variable "dynamodb_table_templates_arn" {
  description = "ARN of the templates DynamoDB table"
  type        = string
}
