# Deployment Runbook

**Last Updated:** January 10, 2026  
**Version:** 1.0.0

## Overview

This runbook provides step-by-step procedures for deploying The Base Standard to production environments.

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All tests passing (`npm run test:frontend`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code review completed
- [ ] All critical bugs resolved

### 2. Environment Configuration
- [ ] Production database configured (PostgreSQL recommended)
- [ ] Environment variables set in deployment platform
- [ ] Smart contract deployed to Base mainnet
- [ ] Contract address updated in environment
- [ ] API keys obtained (OnchainKit, etc.)
- [ ] CORS origins configured if needed

### 3. Database Preparation
- [ ] Database migrations reviewed
- [ ] Backup of current database created
- [ ] Migration script tested on staging
- [ ] Connection pooling configured

## Deployment Procedures

### Vercel Deployment (Recommended)

#### Initial Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_REGISTRY_ADDRESS production
# ... add all required variables
```

#### Deployment Steps
```bash
# 1. Run pre-deployment checks
./scripts/pre-deploy.sh

# 2. Deploy to preview
vercel

# 3. Test preview deployment
# Visit preview URL and verify:
# - Health endpoint: /api/health
# - Reputation endpoint: /api/reputation?address=0x...
# - Leaderboard endpoint: /api/leaderboard

# 4. Deploy to production
vercel --prod
```

#### Post-Deployment Verification
```bash
# Check health endpoint
curl https://your-domain.vercel.app/api/health

# Verify all services are healthy
# - Database connection
# - RPC endpoints
# - Ponder indexer (if configured)
```

### Docker Deployment

#### Build Image
```bash
# Build Docker image
docker build -t base-standard:latest .

# Tag for registry
docker tag base-standard:latest your-registry/base-standard:latest

# Push to registry
docker push your-registry/base-standard:latest
```

#### Deploy Container
```bash
# Run container
docker run -d \
  --name base-standard \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_REGISTRY_ADDRESS="0x..." \
  --env-file .env.production \
  base-standard:latest
```

### Database Migrations

#### Production Migration
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Verify migration
npx prisma db push --accept-data-loss
```

#### Rollback Procedure
```bash
# If migration fails:
# 1. Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD.sql

# 2. Mark migration as rolled back
npx prisma migrate resolve --rolled-back migration_name
```

## Rollback Procedures

### Vercel Rollback
1. Navigate to Vercel Dashboard
2. Select project → Deployments
3. Find previous successful deployment
4. Click "..." → "Promote to Production"
5. Verify rollback at production URL

### Database Rollback
1. **DO NOT** rollback database without backup
2. Restore from pre-deployment backup
3. Coordinate with application rollback
4. Verify data integrity

### Emergency Rollback
```bash
# Quick rollback script
./scripts/rollback.sh production

# Or manually:
vercel rollback <deployment-url>
```

## Monitoring Post-Deployment

### First 15 Minutes
- [ ] Monitor error rates in Vercel dashboard
- [ ] Check health endpoint every 2 minutes
- [ ] Verify API response times
- [ ] Check database connection pool

### First Hour
- [ ] Review error logs
- [ ] Check user reports
- [ ] Monitor performance metrics
- [ ] Verify smart contract interactions

### First 24 Hours
- [ ] Daily error log review
- [ ] Performance metrics analysis
- [ ] User feedback collection
- [ ] Database performance check

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Database Connection Errors
```bash
# Test connection
npx prisma db push

# Check connection string format
echo $DATABASE_URL
```

#### Environment Variable Issues
```bash
# Verify variables are set
vercel env ls

# Pull variables locally for testing
vercel env pull .env.local
```

## Emergency Contacts

- **On-Call Engineer:** [Contact Info]
- **Database Admin:** [Contact Info]
- **DevOps Lead:** [Contact Info]

## Related Documentation

- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md)
- [PRODUCTION_READINESS_REPORT.md](../PRODUCTION_READINESS_REPORT.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
