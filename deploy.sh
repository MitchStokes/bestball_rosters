#!/bin/bash

# Best Ball Rosters Deployment Script

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Get CloudFront distribution ID from Terraform output
echo "📋 Getting CloudFront distribution ID..."
cd terraform
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
cd ..

echo "📦 Building React application..."
cd best-ball-rosters
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://best-ball-rosters-static-site --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Site URL: https://d1y6yie77z1ypy.cloudfront.net"

cd ..