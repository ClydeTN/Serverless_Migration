# infrastructure/modules/api_gateway/main.tf

# API Gateway
resource "aws_apigatewayv2_api" "resume_api" {
  name          = "resume-builder-api"
  protocol_type = "HTTP"
  description   = "Resume Builder API Gateway"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "resume_stage" {
  api_id = aws_apigatewayv2_api.resume_api.id
  name   = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip            = "$context.identity.sourceIp"
      requestTime   = "$context.requestTime"
      httpMethod    = "$context.httpMethod"
      routeKey      = "$context.routeKey"
      status        = "$context.status"
      protocol      = "$context.protocol"
      responseTime  = "$context.responseLatency"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/resume-builder-${var.environment}"
  retention_in_days = 30
}

# User Routes
resource "aws_apigatewayv2_route" "user_routes" {
  for_each = {
    "POST /user" = "createUser"
    "GET /user/{userId}" = "getUser"
    "PUT /user/{userId}" = "updateUser"
    "DELETE /user/{userId}" = "deleteUser"
  }

  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.value].id}"
}

# Project Routes
resource "aws_apigatewayv2_route" "project_routes" {
  for_each = {
    "GET /project/list"     = "listProjects"
    "POST /project/new"     = "createProject"
    "GET /project/info/{projectId}" = "getProjectInfo"
    "GET /project/snapshot/{projectId}" = "getSnapshot"
    "PUT /project/info"     = "updateSnapshot"
    "PATCH /project/info"   = "updateSnapshotField"
    "POST /project/info/{projectId}" = "addDataGroup"
    "DELETE /project"       = "deleteProject"
    "GET /project/thumb/{projectId}" = "getProjectThumb"
    "GET /project/pdf/{projectId}"  = "getProjectPdf"
    "GET /project/html/{projectId}" = "getProjectHtml"
    "GET /project/image/{projectId}" = "getImage"
    "POST /project/image/{projectId}" = "uploadImage"
  }

  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.value].id}"
}

# Template Routes
resource "aws_apigatewayv2_route" "template_routes" {
  for_each = {
    "GET /template/list"     = "listTemplates"
    "GET /template/{templateId}" = "getTemplate"
    "GET /template/preview/{templateId}" = "getTemplatePreview"
    "GET /template/thumbnail/{templateId}" = "getTemplateThumbnail"
    "GET /template/pdf/{templateId}" = "getTemplatePdf"
  }

  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.value].id}"
}

# Auth Routes
resource "aws_apigatewayv2_route" "auth_routes" {
  for_each = {
    login = {
      method = "POST"
      path   = "/auth/login"
    }
    register = {
      method = "POST"
      path   = "/auth/register"
    }
  }

  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = "${each.value.method} ${each.value.path}"

  target = "integrations/${aws_apigatewayv2_integration.auth_integrations[each.key].id}"
}

# Lambda Integrations
resource "aws_apigatewayv2_integration" "lambda" {
  for_each = {
    # User functions
    createUser = "createUser"
    getUser = "getUser"
    updateUser = "updateUser"
    deleteUser = "deleteUser"
    
    # Project functions
    listProjects = "listProjects"
    createProject = "createProject"
    getProjectInfo = "getProjectInfo"
    getSnapshot = "getSnapshot"
    updateSnapshot = "updateSnapshot"
    updateSnapshotField = "updateSnapshotField"
    addDataGroup = "addDataGroup"
    deleteProject = "deleteProject"
    getProjectThumb = "getProjectThumb"
    getProjectPdf = "getProjectPdf"
    getProjectHtml = "getProjectHtml"
    getImage = "getImage"
    uploadImage = "uploadImage"
    
    # Template functions
    listTemplates = "listTemplates"
    getTemplate = "getTemplate"
    getTemplatePreview = "getTemplatePreview"
    getTemplateThumbnail = "getTemplateThumbnail"
    getTemplatePdf = "getTemplatePdf"
  }

  api_id           = aws_apigatewayv2_api.resume_api.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  description        = "Lambda integration for ${each.value}"
  integration_method = "POST"
  integration_uri    = var.lambda_functions[each.value].invoke_arn
}

resource "aws_apigatewayv2_integration" "auth_integrations" {
  for_each = {
    login    = "login"
    register = "register"
  }

  api_id           = aws_apigatewayv2_api.resume_api.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  description        = "Lambda integration for ${each.key} route"
  integration_method = "POST"
  integration_uri    = var.auth_functions[each.key].invoke_arn
}

# Lambda Permissions
resource "aws_lambda_permission" "api_gateway" {
  for_each = var.lambda_functions

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.resume_api.execution_arn}/*/*"
}

#