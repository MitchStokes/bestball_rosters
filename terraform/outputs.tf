output "website_url" {
  description = "URL of the website"
  value       = module.static_site.website_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = module.static_site.cloudfront_distribution_id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.static_site.s3_bucket_name
}