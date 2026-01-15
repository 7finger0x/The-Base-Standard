#!/bin/bash
# Test all API endpoints after deployment
# Usage: ./scripts/test-endpoints.sh [base-url]

BASE_URL=${1:-http://localhost:3000}
API_KEY=${ADMIN_API_KEY:-""}

echo "🧪 Testing API endpoints at $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test health endpoint
echo "1. Testing /api/health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed (200)${NC}"
    echo "$HEALTH_BODY" | jq '.' 2>/dev/null || echo "$HEALTH_BODY"
else
    echo -e "${RED}❌ Health check failed ($HEALTH_CODE)${NC}"
    echo "$HEALTH_BODY"
fi
echo ""

# Test reputation endpoint
echo "2. Testing /api/reputation..."
TEST_ADDRESS="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
REP_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/reputation?address=$TEST_ADDRESS")
REP_CODE=$(echo "$REP_RESPONSE" | tail -n1)
REP_BODY=$(echo "$REP_RESPONSE" | head -n-1)

if [ "$REP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Reputation endpoint passed (200)${NC}"
    echo "$REP_BODY" | jq '.data.totalScore' 2>/dev/null || echo "$REP_BODY"
else
    echo -e "${RED}❌ Reputation endpoint failed ($REP_CODE)${NC}"
    echo "$REP_BODY"
fi
echo ""

# Test leaderboard endpoint
echo "3. Testing /api/leaderboard..."
LB_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/leaderboard?limit=10")
LB_CODE=$(echo "$LB_RESPONSE" | tail -n1)
LB_BODY=$(echo "$LB_RESPONSE" | head -n-1)

if [ "$LB_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Leaderboard endpoint passed (200)${NC}"
    LEADERBOARD_COUNT=$(echo "$LB_BODY" | jq '.leaderboard | length' 2>/dev/null || echo "0")
    echo "   Found $LEADERBOARD_COUNT entries"
else
    echo -e "${RED}❌ Leaderboard endpoint failed ($LB_CODE)${NC}"
    echo "$LB_BODY"
fi
echo ""

# Test admin endpoint (if API key provided)
if [ -n "$API_KEY" ]; then
    echo "4. Testing /api/admin/update-score..."
    ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d '{"address":"0x742d35Cc6634C0532925a3b844Bc454e4438f44e","score":500,"category":"test","points":100}' \
        "$BASE_URL/api/admin/update-score")
    ADMIN_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
    
    if [ "$ADMIN_CODE" = "200" ] || [ "$ADMIN_CODE" = "401" ]; then
        echo -e "${GREEN}✅ Admin endpoint accessible ($ADMIN_CODE)${NC}"
    else
        echo -e "${RED}❌ Admin endpoint failed ($ADMIN_CODE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping admin endpoint test (no API key)${NC}"
fi
echo ""

# Test invalid address
echo "5. Testing input validation..."
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/reputation?address=invalid")
INVALID_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)

if [ "$INVALID_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Input validation working (400)${NC}"
else
    echo -e "${RED}❌ Input validation failed ($INVALID_CODE)${NC}"
fi
echo ""

# Test rate limiting (if local)
if [[ "$BASE_URL" == *"localhost"* ]]; then
    echo "6. Testing rate limiting..."
    RATE_LIMIT_COUNT=0
    for i in {1..105}; do
        RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health" -o /dev/null)
        CODE=$(echo "$RESPONSE" | tail -n1)
        if [ "$CODE" = "429" ]; then
            RATE_LIMIT_COUNT=$((RATE_LIMIT_COUNT + 1))
        fi
    done
    
    if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Rate limiting working ($RATE_LIMIT_COUNT 429 responses)${NC}"
    else
        echo -e "${YELLOW}⚠️  Rate limiting not triggered (may be disabled in dev)${NC}"
    fi
fi

echo ""
echo "✅ Endpoint testing complete!"
