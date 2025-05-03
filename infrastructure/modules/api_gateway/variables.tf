variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "lambda_functions" {
  description = "Map of Lambda functions to integrate with API Gateway"
  type = map(object({
    function_name = string
    invoke_arn    = string
  }))
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
}

variable "dynamodb_table_templates" {
  description = "DynamoDB table name for templates"
  type        = string
}

variable "auth_functions" {
  description = "Map of auth Lambda functions"
  type = map(object({
    invoke_arn = string
  }))
}
