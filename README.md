# Best Ball Rosters

A comprehensive fantasy football best ball roster analysis application built with React, TypeScript, and deployed on AWS.

## Features

- **Rosters Page**: Browse and filter fantasy rosters with advanced filtering by teams, players, and position counts
- **Stacks Page**: Analyze same-team player combinations with frequency and ADP metrics
- **Player Associations**: Discover which players are commonly drafted together
- **Player Exposure**: View roster counts and exposure percentages for all players

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS for styling
- AWS S3 + CloudFront for hosting
- Terraform for infrastructure management

## Development

### Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- Terraform installed

### Local Development

```bash
cd best-ball-rosters
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

## Deployment

### 1. Infrastructure Setup

Deploy AWS infrastructure using Terraform:

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

This creates:
- S3 bucket for static hosting
- CloudFront distribution for CDN
- Origin Access Control for secure S3 access
- Bucket policies and configurations

### 2. Build and Deploy Application

```bash
# Build the React application
cd best-ball-rosters
npm run build

# Deploy to S3 bucket
aws s3 sync dist/ s3://best-ball-rosters-static-site --delete
```

### 3. Get Deployment URL

```bash
cd terraform
terraform output website_url
```

## Infrastructure Details

The application is deployed on AWS using:

- **S3 Bucket**: `best-ball-rosters-static-site` for static file hosting
- **CloudFront**: Global CDN with custom error pages for SPA routing
- **Domain**: Uses CloudFront default domain (no custom domain configured)
- **Security**: Origin Access Control restricts direct S3 access

## Data Sources

- `rosters.json`: Fantasy roster data
- `draftables.json`: Player information with accurate positions and teams
- `adp.csv`: Average Draft Position rankings

## Live Site

The application is deployed at: https://d1y6yie77z1ypy.cloudfront.net