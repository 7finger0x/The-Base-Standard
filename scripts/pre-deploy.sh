#!/bin/bash
# Pre-deployment validation script
# Run this before deploying to production

set -e

echo "🔍 Running pre-deployment checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Type check
echo "🔎 Running TypeScript type check..."
if npm run typecheck; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    exit 1
fi

# Lint
echo "🔍 Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${RED}❌ Lint check failed${NC}"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if npm run test:frontend; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi

# Build
echo "🏗️  Building application..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f .env.example ]; then
    echo -e "${YELLOW}⚠️  Please verify all required environment variables are set${NC}"
    echo "   Required variables:"
    grep -E "^[A-Z_]+=" .env.example | sed 's/^/   - /'
fi

# Check for secrets in code
echo "🔒 Checking for hardcoded secrets..."
if grep -r "password.*=.*['\"].*['\"]" src/ --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${RED}❌ Potential hardcoded secrets found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No hardcoded secrets detected${NC}"
fi

# Prisma check
echo "🗄️  Checking Prisma schema..."
if npx prisma validate; then
    echo -e "${GREEN}✅ Prisma schema valid${NC}"
else
    echo -e "${RED}❌ Prisma schema invalid${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
echo "🚀 Ready for deployment"
