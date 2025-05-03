# Lambda function outputs
output "lambda_functions" {
  description = "Map of Lambda functions with their ARNs and names"
  value = {
    projects = {
      for name, function in aws_lambda_function.project_functions : name => {
        function_name = function.function_name
        invoke_arn    = function.invoke_arn
        arn          = function.arn
      }
    }
    templates = {
      for name, function in aws_lambda_function.template_functions : name => {
        function_name = function.function_name
        invoke_arn    = function.invoke_arn
        arn          = function.arn
      }
    }
  }
}

# Lambda execution role outputs
output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_role.arn
}

# Lambda layers outputs
output "lambda_layers" {
  description = "Map of Lambda layers with their ARNs"
  value = {
    models       = aws_lambda_layer_version.models.arn
    repositories = aws_lambda_layer_version.repositories.arn
    library      = aws_lambda_layer_version.library.arn
    middleware   = aws_lambda_layer_version.middleware.arn
  }
}