#!/bin/bash
# Smart Contract Deployment Script for Base Mainnet
# This script deploys the ReputationRegistry contract to Base mainnet

set -e

echo "📜 Smart Contract Deployment to Base Mainnet"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the foundry directory
if [ ! -f "foundry.toml" ]; then
    echo -e "${RED}❌ Error: Must run from project root or foundry directory${NC}"
    echo "   Run: cd foundry && ../scripts/deploy-contract.sh"
    exit 1
fi

# Check for required environment variables
if [ -z "$BASE_RPC_URL" ]; then
    echo -e "${YELLOW}⚠️  BASE_RPC_URL not set, using default: https://mainnet.base.org${NC}"
    export BASE_RPC_URL="https://mainnet.base.org"
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY environment variable is required${NC}"
    echo ""
    echo "Set your deployer private key:"
    echo "  export PRIVATE_KEY='0x...'"
    echo ""
    echo "⚠️  WARNING: Never commit your private key to git!"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  BASESCAN_API_KEY not set, contract will not be verified${NC}"
    echo "   Get API key from: https://basescan.org/myapikey"
    VERIFY_FLAG=""
else
    VERIFY_FLAG="--verify --etherscan-api-key $BASESCAN_API_KEY"
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   RPC URL: $BASE_RPC_URL"
echo "   Network: Base Mainnet (Chain ID: 8453)"
if [ -n "$BASESCAN_API_KEY" ]; then
    echo "   Verification: Enabled"
else
    echo "   Verification: Disabled"
fi
echo ""

# Change to foundry directory if not already there
if [ ! -f "foundry.toml" ] && [ -d "foundry" ]; then
    cd foundry
fi

echo "🔍 Step 1: Building contracts..."
if forge build; then
    echo -e "${GREEN}✅ Contracts built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 2: Running tests..."
if forge test; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    echo -e "${YELLOW}⚠️  Continue anyway? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔍 Step 3: Deploying contract..."
echo -e "${YELLOW}⚠️  This will deploy to Base MAINNET and cost gas fees${NC}"
echo -e "${YELLOW}⚠️  Make sure you have enough ETH in your deployer wallet${NC}"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

DEPLOY_CMD="forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --private-key $PRIVATE_KEY $VERIFY_FLAG"

echo "Running deployment command..."
echo ""

if eval "$DEPLOY_CMD"; then
    echo ""
    echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
    echo ""
    
    # Try to extract contract address from output
    echo "📝 Next steps:"
    echo "   1. Find the deployed contract address in the output above"
    echo "   2. Verify contract on Basescan: https://basescan.org/address/<ADDRESS>"
    echo "   3. Update NEXT_PUBLIC_REGISTRY_ADDRESS in environment variables:"
    echo "      export NEXT_PUBLIC_REGISTRY_ADDRESS='0x...'"
    echo "   4. Test contract functions:"
    echo "      - linkWallet()"
    echo "      - updateScore() (if admin)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient ETH in deployer wallet"
    echo "  - Invalid RPC URL"
    echo "  - Network connectivity issues"
    echo "  - Invalid private key format"
    exit 1
fi
