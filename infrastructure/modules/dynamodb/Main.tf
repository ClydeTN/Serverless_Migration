# infrastructure/modules/dynamodb/main.tf

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # GSI for email lookups
  global_secondary_index {
    name               = "EmailIndex"
    hash_key           = "email"
    projection_type    = "ALL"
  }

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Projects Table
resource "aws_dynamodb_table" "projects" {
  name           = "projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  range_key      = "userId"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  # GSI for querying projects by userId
  global_secondary_index {
    name               = "UserIdIndex"
    hash_key           = "userId"
    range_key          = "creationDate"
    projection_type    = "ALL"
  }

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Snapshots Table
resource "aws_dynamodb_table" "snapshots" {
  name           = "snapshots"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "projectId"

  attribute {
    name = "projectId"
    type = "S"
  }

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Enumerable Data Table (combines all enumerable types)
resource "aws_dynamodb_table" "enumerable_data" {
  name           = "enumerable_data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "projectId"
  range_key      = "type#tag"

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "type#tag"
    type = "S"
  }

  # GSI for querying by type
  global_secondary_index {
    name               = "TypeIndex"
    hash_key           = "type"
    range_key          = "projectId"
    projection_type    = "ALL"
  }

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Orders Table
resource "aws_dynamodb_table" "orders" {
  name           = "orders"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "projectId"

  attribute {
    name = "projectId"
    type = "S"
  }

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# TTL for automatic cleanup
resource "aws_dynamodb_table_ttl" "users_ttl" {
  table_name = aws_dynamodb_table.users.name
  attribute_name = "ttl"
}

resource "aws_dynamodb_table_ttl" "projects_ttl" {
  table_name = aws_dynamodb_table.projects.name
  attribute_name = "ttl"
}

resource "aws_dynamodb_table_ttl" "snapshots_ttl" {
  table_name = aws_dynamodb_table.snapshots.name
  attribute_name = "ttl"
}

resource "aws_dynamodb_table_ttl" "enumerable_data_ttl" {
  table_name = aws_dynamodb_table.enumerable_data.name
  attribute_name = "ttl"
}

resource "aws_dynamodb_table_ttl" "orders_ttl" {
  table_name = aws_dynamodb_table.orders.name
  attribute_name = "ttl"
}