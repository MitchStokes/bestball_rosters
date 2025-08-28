variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = ""
}

variable "bucket_name" {
  description = "S3 bucket name for static website hosting"
  type        = string
  default     = "best-ball-rosters-static-site"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "best-ball-rosters"
    Environment = "production"
  }
}