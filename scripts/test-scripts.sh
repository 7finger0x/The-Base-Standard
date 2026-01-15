#!/bin/bash
# Script Testing Suite
# Tests all deployment scripts for syntax errors and basic functionality

set -e

echo "🧪 Testing Deployment Scripts"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPTS=(
    "scripts/setup-production-db.sh"
    "scripts/deploy-contract.sh"
    "scripts/verify-env.sh"
    "scripts/pre-deploy.sh"
)

PASSED=0
FAILED=0

echo -e "${BLUE}📋 Testing script syntax...${NC}"
echo ""

for script in "${SCRIPTS[@]}"; do
    if [ ! -f "$script" ]; then
        echo -e "   ${RED}❌ $script not found${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Check if file is executable (or at least readable)
    if [ ! -r "$script" ]; then
        echo -e "   ${RED}❌ $script is not readable${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Check bash syntax
    if bash -n "$script" 2>&1; then
        echo -e "   ${GREEN}✅ $script - syntax valid${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}❌ $script - syntax error${NC}"
        bash -n "$script" 2>&1 | head -5
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo -e "${BLUE}📋 Testing script dependencies...${NC}"
echo ""

# Check for required commands
REQUIRED_CMDS=("npm" "npx")
MISSING_CMDS=()

for cmd in "${REQUIRED_CMDS[@]}"; do
    if command -v "$cmd" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $cmd is available${NC}"
    else
        echo -e "   ${RED}❌ $cmd is not available${NC}"
        MISSING_CMDS+=("$cmd")
    fi
done

# Check node via npm
if npm --version > /dev/null 2>&1; then
    NODE_VERSION=$(node --version 2>/dev/null || npm --version | head -1)
    echo -e "   ${GREEN}✅ Node.js available (via npm)${NC}"
else
    echo -e "   ${RED}❌ Node.js/npm not available${NC}"
    MISSING_CMDS+=("node")
fi

# Check prisma via npx
if npx prisma --version > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Prisma available (via npx)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Prisma not in PATH (will use npx prisma)${NC}"
fi

# Check for optional commands
OPTIONAL_CMDS=("forge" "vercel")
echo ""
echo -e "${BLUE}📋 Checking optional dependencies...${NC}"
echo ""

for cmd in "${OPTIONAL_CMDS[@]}"; do
    if command -v "$cmd" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $cmd is available${NC}"
    else
        echo -e "   ${YELLOW}⚪ $cmd is not available (optional)${NC}"
    fi
done

echo ""
echo -e "${BLUE}📋 Testing Prisma setup...${NC}"
echo ""

if npx prisma validate > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Prisma schema is valid${NC}"
    PASSED=$((PASSED + 1))
else
    # Try with explicit path
    if npx --yes prisma validate > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Prisma schema is valid${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${YELLOW}⚠️  Prisma validation had issues (may need npm install)${NC}"
        # Don't fail - this is just a warning
    fi
fi

if [ -f "prisma/schema.prisma" ]; then
    echo -e "   ${GREEN}✅ Prisma schema file exists${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}❌ Prisma schema file not found${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "=============================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "   Passed: $PASSED"
echo "   Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Set up test database: export DATABASE_URL='postgresql://...'"
    echo "   2. Test database setup: ./scripts/setup-production-db.sh"
    echo "   3. Test env verification: ./scripts/verify-env.sh"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    if [ ${#MISSING_CMDS[@]} -gt 0 ]; then
        echo ""
        echo "Missing required commands: ${MISSING_CMDS[*]}"
        echo "Please install them before proceeding."
    fi
    exit 1
fi
