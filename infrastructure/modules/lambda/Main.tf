# infrastructure/modules/lambda/main.tf

# User Routes Lambda Functions
resource "aws_lambda_function" "user_functions" {
  for_each = {
    createUser = {
      handler = "createUser.handler"
      timeout = 30
      memory  = 256
    }
    getUser = {
      handler = "getUser.handler"
      timeout = 30
      memory  = 256
    }
    updateUser = {
      handler = "updateUser.handler"
      timeout = 30
      memory  = 256
    }
    deleteUser = {
      handler = "deleteUser.handler"
      timeout = 30
      memory  = 256
    }
  }

  filename         = "src/functions/users/${each.key}.zip"
  function_name    = "resume-builder-${each.key}-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = each.value.handler
  runtime         = "nodejs18.x"
  timeout         = each.value.timeout
  memory_size     = each.value.memory

  environment {
    variables = {
      DYNAMODB_TABLE_USERS = var.dynamodb_table_users
      ENVIRONMENT = var.environment
    }
  }

  layers = [
    aws_lambda_layer_version.models.arn,
    aws_lambda_layer_version.repositories.arn,
    aws_lambda_layer_version.library.arn,
    aws_lambda_layer_version.middleware.arn,
    aws_lambda_layer_version.controllers.arn
  ]

  tags = {
    Environment = var.environment
    Service     = "resume-builder"
    Component   = "user-functions"
  }
}

# Project Routes Lambda Functions
resource "aws_lambda_function" "project_functions" {
  for_each = {
    listProjects = {
      handler = "listProjects.handler"
      timeout = 30
      memory  = 256
    }
    createProject = {
      handler = "createProject.handler"
      timeout = 30
      memory  = 256
    }
    getProjectInfo = {
      handler = "getProjectInfo.handler"
      timeout = 30
      memory  = 256
    }
    getSnapshot = {
      handler = "getSnapshot.handler"
      timeout = 30
      memory  = 256
    }
    updateSnapshot = {
      handler = "updateSnapshot.handler"
      timeout = 30
      memory  = 256
    }
    updateSnapshotField = {
      handler = "updateSnapshotField.handler"
      timeout = 30
      memory  = 256
    }
    addDataGroup = {
      handler = "addDataGroup.handler"
      timeout = 30
      memory  = 256
    }
    deleteProject = {
      handler = "deleteProject.handler"
      timeout = 30
      memory  = 256
    }
    getProjectThumb = {
      handler = "getProjectThumb.handler"
      timeout = 60
      memory  = 1024
    }
    getProjectPdf = {
      handler = "getProjectPdf.handler"
      timeout = 60
      memory  = 1024
    }
    getProjectHtml = {
      handler = "getProjectHtml.handler"
      timeout = 30
      memory  = 512
    }
    getImage = {
      handler = "getImage.handler"
      timeout = 30
      memory  = 512
    }
    uploadImage = {
      handler = "uploadImage.handler"
      timeout = 60
      memory  = 1024
    }
  }

  filename         = "src/functions/projects/${each.key}.zip"
  function_name    = "resume-builder-${each.key}-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = each.value.handler
  runtime         = "nodejs18.x"
  timeout         = each.value.timeout
  memory_size     = each.value.memory

  environment {
    variables = {
      DYNAMODB_TABLE_PROJECTS = var.dynamodb_table_projects
      DYNAMODB_TABLE_SNAPSHOTS = var.dynamodb_table_snapshots
      DYNAMODB_TABLE_ENUMERABLE = var.dynamodb_table_enumerable
      DYNAMODB_TABLE_ORDERS = var.dynamodb_table_orders
      S3_BUCKET = var.s3_bucket
      ENVIRONMENT = var.environment
    }
  }

  layers = [
    aws_lambda_layer_version.models.arn,
    aws_lambda_layer_version.repositories.arn,
    aws_lambda_layer_version.library.arn,
    aws_lambda_layer_version.middleware.arn,
    aws_lambda_layer_version.controllers.arn
  ]

  tags = {
    Environment = var.environment
    Service     = "resume-builder"
    Component   = "project-functions"
  }
}

# Template Routes Lambda Functions
resource "aws_lambda_function" "template_functions" {
  for_each = {
    listTemplates = {
      handler = "listTemplates.handler"
      timeout = 30
      memory  = 256
    }
    getTemplate = {
      handler = "getTemplate.handler"
      timeout = 30
      memory  = 256
    }
    createTemplate = {
      handler = "createTemplate.handler"
      timeout = 30
      memory  = 512
    }
    updateTemplate = {
      handler = "updateTemplate.handler"
      timeout = 30
      memory  = 512
    }
    deleteTemplate = {
      handler = "deleteTemplate.handler"
      timeout = 30
      memory  = 256
    }
    getTemplatePreview = {
      handler = "getTemplatePreview.handler"
      timeout = 60
      memory  = 1024
    }
    getTemplateThumbnail = {
      handler = "getTemplateThumbnail.handler"
      timeout = 30
      memory  = 512
    }
  }

  filename         = "src/functions/templates/${each.key}.zip"
  function_name    = "resume-builder-template-${each.key}-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = each.value.handler
  runtime         = "nodejs18.x"
  timeout         = each.value.timeout
  memory_size     = each.value.memory

  environment {
    variables = {
      S3_BUCKET = var.s3_bucket
      ENVIRONMENT = var.environment
    }
  }

  layers = [
    aws_lambda_layer_version.models.arn,
    aws_lambda_layer_version.repositories.arn,
    aws_lambda_layer_version.library.arn,
    aws_lambda_layer_version.middleware.arn,
    aws_lambda_layer_version.controllers.arn
  ]

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Auth Routes Lambda Functions
resource "aws_lambda_function" "auth_functions" {
  for_each = {
    login = {
      handler = "login.handler"
      timeout = 30
      memory  = 256
    }
    register = {
      handler = "register.handler"
      timeout = 30
      memory  = 256
    }
  }

  filename         = "src/functions/auth/${each.key}.zip"
  function_name    = "resume-builder-${each.key}-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = each.value.handler
  runtime         = "nodejs18.x"
  timeout         = each.value.timeout
  memory_size     = each.value.memory

  environment {
    variables = {
      DYNAMODB_TABLE_USERS = var.dynamodb_table_users
      JWT_SECRET = var.jwt_secret
      ENVIRONMENT = var.environment
    }
  }

  layers = [
    aws_lambda_layer_version.models.arn,
    aws_lambda_layer_version.repositories.arn,
    aws_lambda_layer_version.library.arn,
    aws_lambda_layer_version.middleware.arn,
    aws_lambda_layer_version.controllers.arn
  ]

  tags = {
    Environment = var.environment
    Service     = "resume-builder"
    Component   = "auth-functions"
  }
}

# Lambda Layers
resource "aws_lambda_layer_version" "models" {
  filename         = "src/layers/models/nodejs.zip"
  layer_name       = "resume-builder-models-${var.environment}"
  description      = "Models layer for resume builder"
  compatible_runtimes = ["nodejs18.x"]
}

resource "aws_lambda_layer_version" "repositories" {
  filename         = "src/layers/repositories/nodejs.zip"
  layer_name       = "resume-builder-repositories-${var.environment}"
  description      = "Repositories layer for resume builder"
  compatible_runtimes = ["nodejs18.x"]
}

resource "aws_lambda_layer_version" "library" {
  filename         = "src/layers/library/nodejs.zip"
  layer_name       = "resume-builder-library-${var.environment}"
  description      = "Library layer for resume builder"
  compatible_runtimes = ["nodejs18.x"]
}

resource "aws_lambda_layer_version" "middleware" {
  filename         = "src/layers/middleware/nodejs.zip"
  layer_name       = "resume-builder-middleware-${var.environment}"
  description      = "Middleware layer for resume builder"
  compatible_runtimes = ["nodejs18.x"]
}

resource "aws_lambda_layer_version" "controllers" {
  filename         = "src/layers/controllers/nodejs.zip"
  layer_name       = "resume-builder-controllers-${var.environment}"
  description      = "Controllers layer for resume builder"
  compatible_runtimes = ["nodejs18.x"]
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

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "resume-builder-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          var.dynamodb_table_projects_arn,
          var.dynamodb_table_snapshots_arn,
          var.dynamodb_table_enumerable_arn,
          var.dynamodb_table_orders_arn,
          var.dynamodb_table_users_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_lambda_function" "template_functions" {
  for_each = {
    listTemplates = {
      handler = "listTemplates.handler"
      timeout = 30
      memory  = 256
    }
    getTemplate = {
      handler = "getTemplate.handler"
      timeout = 30
      memory  = 256
    }
    getTemplatePreview = {
      handler = "getTemplatePreview.handler"
      timeout = 30
      memory  = 512
    }
    getTemplateThumbnail = {
      handler = "getTemplateThumbnail.handler"
      timeout = 30
      memory  = 512
    }
    getTemplatePdf = {
      handler = "getTemplatePdf.handler"
      timeout = 60
      memory  = 1024
    }
  }

  filename         = "src/functions/templates/${each.key}.zip"
  function_name    = "resume-builder-template-${each.key}-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = each.value.handler
  runtime         = "nodejs18.x"
  timeout         = each.value.timeout
  memory_size     = each.value.memory

  environment {
    variables = {
      S3_BUCKET = var.s3_bucket
      DYNAMODB_TABLE_TEMPLATES = var.dynamodb_table_templates
      ENVIRONMENT = var.environment
    }
  }

  layers = [
    aws_lambda_layer_version.models.arn,
    aws_lambda_layer_version.repositories.arn,
    aws_lambda_layer_version.library.arn,
    aws_lambda_layer_version.controllers.arn
  ]
}
