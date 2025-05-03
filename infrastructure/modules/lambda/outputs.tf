output "lambda_functions" {
  value = {
    for k, v in aws_lambda_function.user_functions : k => {
      function_name = v.function_name
      invoke_arn    = v.invoke_arn
    }
  }
}

output "auth_functions" {
  value = {
    for k, v in aws_lambda_function.auth_functions : k => {
      function_name = v.function_name
      invoke_arn    = v.invoke_arn
    }
  }
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_role.arn
} 