#!/bin/bash

# BaseRank Test Runner
# Runs all tests across all layers

set -e

echo "🧪 BaseRank Protocol - Test Suite Runner"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and capture results
run_test_suite() {
    local name=$1
    local command=$2

    echo -e "${BLUE}Running $name...${NC}"

    if eval $command; then
        echo -e "${GREEN}✅ $name PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $name FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi

    echo ""
}

# 1. Smart Contract Tests
echo -e "${YELLOW}1. Testing Smart Contracts (Foundry)${NC}"
echo "-------------------------------------------"
run_test_suite "Smart Contract Tests" "cd foundry && forge test"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 2. Python Agent Tests
echo -e "${YELLOW}2. Testing Python Agent${NC}"
echo "-------------------------------------------"
if [ -f "apps/agent/requirements-test.txt" ]; then
    echo "Installing Python test dependencies..."
    cd apps/agent && pip install -q -r requirements-test.txt && cd ../..
fi
run_test_suite "Python Agent Tests" "cd apps/agent && pytest -v"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 3. Indexer Tests
echo -e "${YELLOW}3. Testing Indexer${NC}"
echo "-------------------------------------------"
run_test_suite "Indexer Tests" "cd apps/indexer && npx vitest run"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 4. Frontend Tests
echo -e "${YELLOW}4. Testing Frontend${NC}"
echo "-------------------------------------------"
run_test_suite "Frontend Tests" "npx vitest run"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Summary
echo ""
echo "=========================================="
echo -e "${BLUE}Test Summary${NC}"
echo "=========================================="
echo -e "Total Test Suites: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review and fix.${NC}"
    exit 1
fi
