#!/bin/bash
# Environment Variable Verification Script
# Validates all required environment variables for production

set -e

echo "🔐 Environment Variable Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "NEXT_PUBLIC_BASE_RPC_URL"
    "NEXT_PUBLIC_REGISTRY_ADDRESS"
    "NEXT_PUBLIC_CHAIN_ID"
    "NEXT_PUBLIC_ONCHAINKIT_API_KEY"
)

# Optional variables
OPTIONAL_VARS=(
    "ADMIN_API_KEY"
    "PONDER_URL"
    "PONDER_RPC_URL_BASE"
    "PONDER_RPC_URL_ZORA"
)

MISSING_REQUIRED=()
INVALID_VARS=()

echo -e "${BLUE}📋 Checking required variables...${NC}"
echo ""

# Check required variables
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "   ${RED}❌ $var is not set${NC}"
        MISSING_REQUIRED+=("$var")
    else
        # Validate specific variables
        case $var in
            "DATABASE_URL")
                if [[ "${!var}" == *"file:"* ]] || [[ "${!var}" == *"sqlite"* ]]; then
                    echo -e "   ${RED}❌ $var appears to be SQLite (not suitable for production)${NC}"
                    INVALID_VARS+=("$var")
                elif [[ "${!var}" != *"postgresql://"* ]]; then
                    echo -e "   ${YELLOW}⚠️  $var may not be a valid PostgreSQL URL${NC}"
                else
                    echo -e "   ${GREEN}✅ $var is set${NC}"
                fi
                ;;
            "NEXTAUTH_SECRET")
                if [ ${#!var} -lt 32 ]; then
                    echo -e "   ${RED}❌ $var is too short (minimum 32 characters)${NC}"
                    INVALID_VARS+=("$var")
                else
                    echo -e "   ${GREEN}✅ $var is set${NC}"
                fi
                ;;
            "NEXT_PUBLIC_REGISTRY_ADDRESS")
                if [[ ! "${!var}" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
                    echo -e "   ${RED}❌ $var is not a valid Ethereum address${NC}"
                    INVALID_VARS+=("$var")
                elif [[ "${!var}" == "0xA69FFF6D7B3D47E4945F0bF60Aac73f49DBd59a9" ]]; then
                    echo -e "   ${RED}❌ $var is the testnet address (must be mainnet)${NC}"
                    INVALID_VARS+=("$var")
                else
                    echo -e "   ${GREEN}✅ $var is set${NC}"
                fi
                ;;
            "NEXT_PUBLIC_CHAIN_ID")
                if [ "${!var}" != "8453" ]; then
                    echo -e "   ${YELLOW}⚠️  $var is ${!var} (expected 8453 for Base mainnet)${NC}"
                else
                    echo -e "   ${GREEN}✅ $var is set correctly${NC}"
                fi
                ;;
            "NEXTAUTH_URL")
                if [[ ! "${!var}" =~ ^https?:// ]]; then
                    echo -e "   ${RED}❌ $var must be a valid URL${NC}"
                    INVALID_VARS+=("$var")
                elif [[ "${!var}" == *"localhost"* ]] && [[ "${NODE_ENV:-}" == "production" ]]; then
                    echo -e "   ${RED}❌ $var points to localhost in production${NC}"
                    INVALID_VARS+=("$var")
                else
                    echo -e "   ${GREEN}✅ $var is set${NC}"
                fi
                ;;
            *)
                echo -e "   ${GREEN}✅ $var is set${NC}"
                ;;
        esac
    fi
done

echo ""
echo -e "${BLUE}📋 Checking optional variables...${NC}"
echo ""

# Check optional variables
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "   ${YELLOW}⚪ $var is not set (optional)${NC}"
    else
        echo -e "   ${GREEN}✅ $var is set${NC}"
    fi
done

echo ""

# Summary
if [ ${#MISSING_REQUIRED[@]} -gt 0 ] || [ ${#INVALID_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Validation failed${NC}"
    echo ""
    
    if [ ${#MISSING_REQUIRED[@]} -gt 0 ]; then
        echo "Missing required variables:"
        for var in "${MISSING_REQUIRED[@]}"; do
            echo "  - $var"
        done
        echo ""
    fi
    
    if [ ${#INVALID_VARS[@]} -gt 0 ]; then
        echo "Invalid variables:"
        for var in "${INVALID_VARS[@]}"; do
            echo "  - $var"
        done
        echo ""
    fi
    
    echo "Set variables in your environment or .env.production file"
    exit 1
else
    echo -e "${GREEN}✅ All required variables are set and valid!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Verify variables are set in Vercel dashboard"
    echo "   2. Test deployment with: npm run build"
    echo "   3. Deploy to production"
    exit 0
fi
