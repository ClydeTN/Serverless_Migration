
variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
}

variable "dynamodb_table_templates" {
  description = "DynamoDB table name for templates"
  type        = string
}
