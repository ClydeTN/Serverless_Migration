# infrastructure/modules/api_gateway/outputs.tf

output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.resume_api.id
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.resume_api.api_endpoint
}

output "stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_apigatewayv2_stage.resume_stage.name
}

output "execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_apigatewayv2_api.resume_api.execution_arn
}