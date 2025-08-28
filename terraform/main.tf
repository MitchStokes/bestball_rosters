terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "static_site" {
  source = "./modules/static-site"
  
  domain_name = var.domain_name
  bucket_name = var.bucket_name
  
  tags = var.tags
}