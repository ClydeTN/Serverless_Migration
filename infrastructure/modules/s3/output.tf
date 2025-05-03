# infrastructure/modules/s3/outputs.tf

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.resume_builder.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.resume_builder.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.resume_builder.bucket_domain_name
}
# infrastructure/modules/s3/variables.tf

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}