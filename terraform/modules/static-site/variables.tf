variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = ""
}

variable "bucket_name" {
  description = "S3 bucket name for static website hosting"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}