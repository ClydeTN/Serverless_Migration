variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  type        = string
} 