# infrastructure/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket = "terraform-state-resume-builder"
    key    = "state/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket (no dependencies)
module "s3" {
  source      = "./modules/s3"
  environment = var.environment
  lambda_role_arn = aws_iam_role.lambda_role.arn
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "resume-builder-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda Functions (depends on S3)
module "lambda" {
  source = "./modules/lambda"
  environment = var.environment
  jwt_secret = var.jwt_secret
  
  # DynamoDB table names and ARNs
  dynamodb_table_projects   = module.dynamodb.projects_table_name
  dynamodb_table_snapshots  = module.dynamodb.snapshots_table_name
  dynamodb_table_enumerable = module.dynamodb.enumerable_table_name
  dynamodb_table_orders     = module.dynamodb.orders_table_name
  dynamodb_table_templates  = module.dynamodb.templates_table_name
  dynamodb_table_users      = module.dynamodb.users_table_name

  dynamodb_table_projects_arn   = module.dynamodb.projects_table_arn
  dynamodb_table_snapshots_arn  = module.dynamodb.snapshots_table_arn
  dynamodb_table_enumerable_arn = module.dynamodb.enumerable_table_arn
  dynamodb_table_orders_arn     = module.dynamodb.orders_table_arn
  dynamodb_table_templates_arn  = module.dynamodb.templates_table_arn
  dynamodb_table_users_arn      = module.dynamodb.users_table_arn

  # S3 bucket
  s3_bucket     = module.s3.bucket_name
  s3_bucket_arn = module.s3.bucket_arn
}

# DynamoDB Tables (depends on S3)
module "dynamodb" {
  source      = "./modules/dynamodb"
  environment = var.environment
  s3_bucket   = module.s3.bucket_name
  dynamodb_table_templates = "resume-builder-templates-${var.environment}"

  depends_on = [module.s3]
}

# Update S3 bucket with Lambda role (after Lambda is created)
resource "aws_s3_bucket_policy" "lambda_access" {
  bucket = module.s3.bucket_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = module.lambda.lambda_role_arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = ["${module.s3.bucket_arn}/*"]
      }
    ]
  })

  depends_on = [module.lambda]
}

# API Gateway (depends on Lambda)
module "api_gateway" {
  source = "./modules/api_gateway"
  environment = var.environment
  s3_bucket = module.s3.bucket_name
  dynamodb_table_templates = module.dynamodb.templates_table_name
  
  lambda_functions = module.lambda.lambda_functions
  auth_functions = module.lambda.auth_functions

  depends_on = [module.lambda]
}

#