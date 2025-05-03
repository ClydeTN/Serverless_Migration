# infrastructure/modules/s3/main.tf

# Main S3 Bucket
resource "aws_s3_bucket" "resume_builder" {
  bucket = "resume-builder-assets-${var.environment}"

  tags = {
    Environment = var.environment
    Project     = "resume-builder"
  }
}

# Bucket Versioning
resource "aws_s3_bucket_versioning" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CORS Configuration
resource "aws_s3_bucket_cors_configuration" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Bucket Policy
resource "aws_s3_bucket_policy" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowLambdaAccess"
        Effect    = "Allow"
        Principal = {
          AWS = var.lambda_role_arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.resume_builder.arn}/*"
        ]
      }
    ]
  })
}

# Lifecycle Rules
resource "aws_s3_bucket_lifecycle_configuration" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id

  rule {
    id     = "cleanup_old_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Public Access Block
resource "aws_s3_bucket_public_access_block" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "resume_builder" {
  bucket = aws_s3_bucket.resume_builder.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}