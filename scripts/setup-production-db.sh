#!/bin/bash
# Production database setup script
# Usage: ./scripts/setup-production-db.sh [database-url]

set -e

DATABASE_URL=${1:-$DATABASE_URL}

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not provided"
    echo "Usage: ./scripts/setup-production-db.sh [database-url]"
    exit 1
fi

echo "🗄️  Setting up production database..."
echo ""

# Check if DATABASE_URL is for PostgreSQL
if [[ "$DATABASE_URL" == postgresql* ]] || [[ "$DATABASE_URL" == postgres* ]]; then
    echo "✅ PostgreSQL database detected"
    
    # Update Prisma schema if needed
    if grep -q "provider = \"sqlite\"" prisma/schema.prisma; then
        echo "⚠️  Prisma schema is set to SQLite"
        echo "   Please update prisma/schema.prisma:"
        echo "   Change: provider = \"sqlite\""
        echo "   To:     provider = \"postgresql\""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  Non-PostgreSQL database detected"
    echo "   This script is optimized for PostgreSQL"
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Verify connection
echo "🔍 Verifying database connection..."
npx prisma db push --accept-data-loss --skip-generate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify database connection: npx prisma db push"
echo "2. Test queries: npx prisma studio"
echo "3. Set up connection pooling (if using PostgreSQL)"
echo "4. Configure database backups"
