# Quick Deployment Guide

**Date:** January 15, 2026  
**Time Estimate:** 2-3 hours for complete setup

---

## 🚀 Fast Track Deployment

### Prerequisites
- [ ] Neon account (https://neon.tech) OR Vercel Postgres
- [ ] Base mainnet wallet with ETH for gas
- [ ] Coinbase Developer Portal account
- [ ] Vercel account

---

## Step 1: Database Setup (30 minutes)

```bash
# 1. Get your Neon connection string from dashboard
# Format: postgresql://user:pass@host/db

# 2. Set environment variable
export DATABASE_URL="postgresql://..."

# 3. Run automated setup
./scripts/setup-production-db.sh
```

**What it does:**

- Validates Prisma schema
- Generates Prisma Client
- Runs migrations
- Verifies all tables created
- Tests database connection

**Expected output:**

```text
✅ Database setup complete!
```

---

## Step 2: Deploy Smart Contract (30-45 minutes)

```bash
# 1. Set deployment variables
export PRIVATE_KEY="0x..." # Your deployer wallet private key
export BASE_RPC_URL="https://mainnet.base.org"
export BASESCAN_API_KEY="..." # Optional, for verification

# 2. Deploy contract
cd foundry
../scripts/deploy-contract.sh
```

**What it does:**

- Builds contracts
- Runs tests
- Deploys to Base mainnet
- Verifies contract (if API key provided)

**Save the contract address from output!**

---

## Step 3: Configure Environment (30 minutes)

### 3.1 Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Save this value - you'll need it!
```

### 3.2 Create .env.production

```bash
# Database
DATABASE_URL="postgresql://..." # From Step 1

# NextAuth
NEXTAUTH_SECRET="..." # From openssl command above
NEXTAUTH_URL="https://your-app.vercel.app"

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..." # From Step 2
NEXT_PUBLIC_CHAIN_ID="8453"

# OnchainKit (get from https://portal.cdp.coinbase.com/)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="..."

# Optional
ADMIN_API_KEY="..." # For admin endpoints
```

### 3.3 Verify Environment

```bash
# Load variables
export $(cat .env.production | xargs)

# Verify all variables
./scripts/verify-env.sh
```

---

## Step 4: Deploy to Vercel (30 minutes)

### 4.1 Pre-Deployment Checks

```bash
# Run automated checks
./scripts/pre-deploy.sh

# Or manually:
npm run typecheck
npm run lint
npm run test:frontend
npm run build
```

### 4.2 Set Vercel Environment Variables

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Add all variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_REGISTRY_ADDRESS production
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_BASE_RPC_URL production
vercel env add NEXT_PUBLIC_CHAIN_ID production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
```

### 4.3 Deploy

```bash
# Deploy to preview first
vercel

# Test preview URL
# - Health: https://your-preview.vercel.app/api/health
# - Homepage: https://your-preview.vercel.app

# Deploy to production
vercel --prod
```

---

## Step 5: Verify Deployment (15 minutes)

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Test reputation endpoint
curl "https://your-domain.vercel.app/api/reputation?address=0x..."

# Manual checks:
# - [ ] Homepage loads
# - [ ] Wallet connection works
# - [ ] Score calculation works
# - [ ] Leaderboard loads
```

---

## 🎯 Complete Checklist

- [ ] Database set up and migrations run
- [ ] Smart contract deployed to Base mainnet
- [ ] Contract address saved
- [ ] All environment variables configured
- [ ] Environment variables verified
- [ ] Vercel environment variables set
- [ ] Pre-deployment checks passed
- [ ] Preview deployment tested
- [ ] Production deployment successful
- [ ] All endpoints verified

---

## 🆘 Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL format (must be PostgreSQL)
- Check if database allows connections from your IP
- Verify credentials are correct

### Contract Deployment Issues

- Ensure wallet has enough ETH for gas
- Verify RPC URL is correct
- Check private key format (must start with 0x)

### Vercel Deployment Issues

- Verify all environment variables are set
- Check build logs in Vercel dashboard
- Ensure DATABASE_URL is accessible from Vercel

---

## 📚 Additional Resources

- [Local Testing Guide](./LOCAL_TESTING.md) - Test scripts before production
- [Script Reference](./SCRIPT_REFERENCE.md) - All automation scripts
- [Detailed Action Plan](../ACTION_PLAN.md) - Day-by-day breakdown
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Complete checklist
- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md) - Detailed procedures

---

**Total Time:** ~2-3 hours  
**Ready for:** Production launch 🚀
