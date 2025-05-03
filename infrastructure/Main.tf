module "api_gateway" {
  source = "./modules/api_gateway"

  environment = var.environment
  s3_bucket = module.s3.bucket_name
  dynamodb_table_templates = module.dynamodb.templates_table_name
  lambda_functions = {
    for k, v in module.lambda.user_functions : k => {
      invoke_arn = v.invoke_arn
    }
  }
  auth_functions = {
    for k, v in module.lambda.auth_functions : k => {
      invoke_arn = v.invoke_arn
    }
  }
}

# Lambda Functions
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