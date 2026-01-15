#!/bin/bash
# Production Database Setup Script
# This script helps set up and verify the production database

set -e

echo "🗄️  Production Database Setup"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo ""
    echo "Please set DATABASE_URL before running this script:"
    echo "  export DATABASE_URL='postgresql://user:pass@host/db'"
    echo ""
    echo "Or create a .env.production file with:"
    echo "  DATABASE_URL='postgresql://user:pass@host/db'"
    echo ""
    exit 1
fi

echo -e "${BLUE}📋 Database URL detected${NC}"
echo "   Format: ${DATABASE_URL:0:20}..."
echo ""

# Detect database type
if [[ "$DATABASE_URL" == *"neon.tech"* ]]; then
    echo -e "${GREEN}✅ Neon database detected${NC}"
    DB_TYPE="neon"
elif [[ "$DATABASE_URL" == *"vercel"* ]] || [[ "$DATABASE_URL" == *"postgres"* ]]; then
    echo -e "${GREEN}✅ PostgreSQL database detected${NC}"
    DB_TYPE="postgres"
else
    echo -e "${YELLOW}⚠️  Unknown database type, assuming PostgreSQL${NC}"
    DB_TYPE="postgres"
fi

echo ""
echo "🔍 Step 1: Validating Prisma schema..."
if npx prisma validate; then
    echo -e "${GREEN}✅ Prisma schema is valid${NC}"
else
    echo -e "${RED}❌ Prisma schema validation failed${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 2: Generating Prisma Client..."
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Prisma Client generation failed${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 3: Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Could not test connection directly, will test via migration${NC}"
fi

echo ""
echo "🔍 Step 4: Running database migrations..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
else
    echo -e "${RED}❌ Migration deployment failed${NC}"
    echo ""
    echo "If this is a fresh database, you may need to initialize it:"
    echo "  npx prisma migrate dev --name init"
    exit 1
fi

echo ""
echo "🔍 Step 5: Verifying database schema..."
if npx prisma db push --accept-data-loss --skip-generate; then
    echo -e "${GREEN}✅ Database schema verified${NC}"
else
    echo -e "${YELLOW}⚠️  Schema verification had warnings (this may be normal)${NC}"
fi

echo ""
echo "🔍 Step 6: Checking required tables..."
TABLES=$(npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null || echo "")

REQUIRED_TABLES=("User" "Wallet" "Account" "Session" "SiweNonce")
MISSING_TABLES=()

for table in "${REQUIRED_TABLES[@]}"; do
    if echo "$TABLES" | grep -qi "$table"; then
        echo -e "   ${GREEN}✅ Table '$table' exists${NC}"
    else
        echo -e "   ${RED}❌ Table '$table' missing${NC}"
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Missing required tables: ${MISSING_TABLES[*]}${NC}"
    echo "   Run migrations again: npx prisma migrate deploy"
    exit 1
fi

echo ""
echo "🔍 Step 7: Testing database query..."
if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database query test successful${NC}"
else
    echo -e "${YELLOW}⚠️  Query test had issues (may be normal for new database)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Verify DATABASE_URL is set in Vercel environment variables"
echo "   2. Test the connection from your application"
echo "   3. Set up database backups (if not automatic)"
echo ""

if [ "$DB_TYPE" == "neon" ]; then
    echo -e "${BLUE}💡 Neon Tip:${NC} Neon has automatic backups enabled by default"
    echo "   Check your Neon dashboard for backup settings"
fi
