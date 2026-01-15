#!/bin/bash
# Vercel deployment script
# Usage: ./scripts/deploy-vercel.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to Vercel ($ENVIRONMENT)..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
./scripts/pre-deploy.sh

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Deploying to production..."
    vercel --prod
else
    echo "📦 Deploying to preview..."
    vercel
fi

echo "✅ Deployment complete!"
echo "🔗 Check your deployment at: https://your-project.vercel.app"
