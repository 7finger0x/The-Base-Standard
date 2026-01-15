# Action Plan - Immediate Next Steps

**Date:** January 15, 2026  
**Status:** Ready for Execution

---

## 🎯 Phase 1: Production Deployment (Week 1)

> **💡 Quick Start:** For a streamlined deployment, see [Quick Deploy Guide](./deployment/QUICK_DEPLOY.md) (2-3 hours total)

---

### Day 1-2: Database Setup

**Estimated Time:** 4-6 hours (or 30 minutes with automated script)

#### Step 1: Choose & Set Up Production Database
- [ ] **Option A: Neon (Recommended for Vercel)**
  - [ ] Create Neon account at <https://neon.tech>
  - [ ] Create new project
  - [ ] Copy connection string (PostgreSQL format)
  - [ ] Test connection locally
  - [ ] Note: Already configured in `src/lib/db.ts` with Neon adapter

- [ ] **Option B: Vercel Postgres**
  - [ ] Create Postgres database in Vercel dashboard
  - [ ] Copy connection string
  - [ ] Test connection

#### Step 2: Run Migrations

**Option A: Use Automated Script (Recommended)**

```bash
# Make script executable
chmod +x scripts/setup-production-db.sh

# Run setup script (will prompt for DATABASE_URL if not set)
./scripts/setup-production-db.sh
```

**Option B: Manual Steps**
```bash
# Set DATABASE_URL to production connection string
export DATABASE_URL="postgresql://user:pass@host/db"

# Or load from .env.production
export $(cat .env.production | xargs)

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db push --accept-data-loss --skip-generate
```

#### Step 3: Verify Database

- [ ] Check tables created: User, Wallet, Account, Session, SiweNonce
- [ ] Test a simple query
- [ ] Set up database backups (Neon has automatic backups)

**Files to Update:**

- `.env.production` (create if doesn't exist)
- Vercel environment variables

---

### Day 2-3: Smart Contract Deployment
**Estimated Time:** 2-3 hours (or 30-45 minutes with automated script)

#### Step 1: Prepare for Deployment
```bash
cd foundry

# Set Base mainnet RPC URL
export BASE_RPC_URL="https://mainnet.base.org"
# Or use your own RPC endpoint

# Verify contract compiles
forge build

# Run tests
forge test
```

#### Step 2: Deploy Contract

**Option A: Use Automated Script (Recommended)**
```bash
# Set required environment variables
export PRIVATE_KEY="0x..." # Your deployer private key
export BASE_RPC_URL="https://mainnet.base.org" # Optional, has default
export BASESCAN_API_KEY="..." # Optional, for contract verification

# Make script executable
chmod +x scripts/deploy-contract.sh

# Run deployment script
cd foundry
../scripts/deploy-contract.sh
```

**Option B: Manual Deployment**
```bash
cd foundry

# Set environment variables
export PRIVATE_KEY="0x..." # Your deployer private key
export BASE_RPC_URL="https://mainnet.base.org"
export BASESCAN_API_KEY="..." # Optional

# Deploy with verification
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY

# Save the deployed address from output
export NEXT_PUBLIC_REGISTRY_ADDRESS="0x..."
```

**⚠️ Security Note:** Never commit your private key to git. Use environment variables or a secure secret manager.

#### Step 3: Verify Deployment

- [ ] Check contract on Basescan
- [ ] Verify contract source code
- [ ] Test `linkWallet` function
- [ ] Test `updateScore` function (if admin functions available)

**Files to Update:**

- `.env.production`: `NEXT_PUBLIC_REGISTRY_ADDRESS`
- Vercel environment variables

---

### Day 3-4: Environment Configuration
**Estimated Time:** 2-3 hours (or 30 minutes with automated verification)

#### Step 1: Get API Keys
- [ ] **Coinbase OnchainKit API Key**
  - [ ] Go to https://portal.cdp.coinbase.com/
  - [ ] Create new API key
  - [ ] Copy API key

- [ ] **BaseScan API Key (Optional, for contract verification)**
  - [ ] Go to https://basescan.org/
  - [ ] Create account
  - [ ] Get API key

#### Step 2: Configure Environment Variables
Create `.env.production` or set in Vercel:

```bash
# Database
DATABASE_URL="postgresql://..." # From Neon/Vercel

# NextAuth
NEXTAUTH_SECRET="..." # Generate: openssl rand -base64 32
NEXTAUTH_URL="https://your-domain.vercel.app"

# Blockchain
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..." # From contract deployment
NEXT_PUBLIC_CHAIN_ID="8453" # Base mainnet

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY="..." # From Coinbase portal

# Optional
ADMIN_API_KEY="..." # For admin endpoints
PONDER_URL="..." # If using Ponder indexer
```

#### Step 3: Verify Environment Variables

**Use Verification Script:**
```bash
# Set all variables first
export DATABASE_URL="..."
export NEXTAUTH_SECRET="..."
# ... etc

# Run verification script
chmod +x scripts/verify-env.sh
./scripts/verify-env.sh
```

#### Step 4: Set Vercel Environment Variables

**Option A: Via CLI (Recommended for automation)**
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link project (first time only)
vercel link

# Add each variable
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_REGISTRY_ADDRESS production
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_BASE_RPC_URL production
vercel env add NEXT_PUBLIC_CHAIN_ID production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production

# Optional variables
vercel env add ADMIN_API_KEY production
vercel env add PONDER_URL production
```

**Option B: Via Vercel Dashboard**
1. Go to your project in Vercel dashboard
2. Navigate to: Settings → Environment Variables
3. Add each variable for "Production" environment
4. Click "Save"

**Checklist:**

- [ ] All required variables set
- [ ] No testnet addresses in production
- [ ] Secrets not committed to git
- [ ] `.env.production` in `.gitignore`
- [ ] Variables verified with `scripts/verify-env.sh`

---

### Day 4-5: Vercel Deployment
**Estimated Time:** 2-3 hours

#### Step 1: Pre-Deployment Checks
```bash
# Run all checks
npm run typecheck
npm run lint
npm run test:frontend
npm run build

# Verify build succeeds
npm start
# Test locally at http://localhost:3000
```

#### Step 2: Deploy to Preview
```bash
# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Test preview URL
# - Health: https://your-preview.vercel.app/api/health
# - Homepage: https://your-preview.vercel.app
```

#### Step 3: Test Preview Deployment

- [ ] Health endpoint returns 200
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] Wallet connection works
- [ ] No console errors

#### Step 4: Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or via GitHub integration (automatic on push to main)
```

#### Step 5: Post-Deployment Verification
```bash
# Test production endpoints
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/reputation?address=0x...

# Manual checks:
# - [ ] Homepage loads
# - [ ] Wallet connection works
# - [ ] Score calculation works
# - [ ] Leaderboard loads
# - [ ] No errors in browser console
```

---

### Day 5-7: Monitoring & Alerts Setup
**Estimated Time:** 3-4 hours

#### Step 1: Vercel Monitoring

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking
- [ ] Configure performance monitoring

#### Step 2: Health Checks

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Monitor `/api/health` endpoint
- [ ] Set up alerts for downtime

#### Step 3: Logging

- [ ] Review Vercel function logs
- [ ] Set up log aggregation (if needed)
- [ ] Configure error alerts

**Tools:**

- Vercel Analytics (built-in)
- Sentry (optional, for error tracking)
- UptimeRobot (free uptime monitoring)

---

## 🧪 Phase 2: Data Source Integration Testing (Week 2)

### Day 8-9: Base RPC Integration Testing
**Estimated Time:** 4-6 hours

#### Test Cases

- [ ] Test with known Base addresses
- [ ] Verify transaction history retrieval
- [ ] Check gas calculation accuracy
- [ ] Validate first transaction timestamp
- [ ] Test with addresses with no transactions
- [ ] Test with high-volume addresses

**Test Addresses:**
```typescript
// Add to test file
const testAddresses = [
  '0x...', // Known active Base user
  '0x...', // New user (no transactions)
  '0x...', // High-volume user
];
```

#### Validation

- [ ] Compare results with BaseScan
- [ ] Verify score calculations match expected
- [ ] Document any discrepancies

---

### Day 9-10: Zora API Testing
**Estimated Time:** 3-4 hours

#### Test Cases

- [ ] Test Zora API endpoint responses
- [ ] Verify mint count accuracy
- [ ] Check early mint detection
- [ ] Test with users who have no Zora mints
- [ ] Test with users who have many mints

#### Validation

- [ ] Compare with Zora website data
- [ ] Verify timeliness bonus calculation
- [ ] Document API rate limits

---

### Day 10-11: Farcaster Integration Testing
**Estimated Time:** 3-4 hours

#### Test Cases

- [ ] Test FID linking
- [ ] Verify OpenRank score retrieval
- [ ] Check percentile calculation
- [ ] Test with users without Farcaster
- [ ] Validate social proof scoring

#### Validation

- [ ] Compare with Farcaster Hub data
- [ ] Verify OpenRank percentile accuracy
- [ ] Document integration issues

---

### Day 11-12: Score Validation
**Estimated Time:** 4-6 hours

#### Compare PVC vs Legacy Scores

- [ ] Calculate scores for 10-20 test addresses
- [ ] Compare PVC scores with legacy scores
- [ ] Document differences
- [ ] Validate tier assignments
- [ ] Check for edge cases

#### Create Test Report

- [ ] Document test results
- [ ] List any discrepancies
- [ ] Recommend fixes if needed

---

## 👥 Phase 3: User Testing & Feedback (Week 2-3)

### Day 13-14: Beta Tester Recruitment
**Estimated Time:** 2-3 hours

#### Recruit Testers

- [ ] Post in Base ecosystem Discord/Twitter
- [ ] Reach out to known Base users
- [ ] Target: 10-20 beta testers
- [ ] Create feedback form (Google Forms, Typeform)

#### Prepare Testing Materials

- [ ] Create testing guide
- [ ] List test scenarios
- [ ] Set up feedback collection system

---

### Day 15-21: Beta Testing Period
**Estimated Time:** Ongoing

#### Test Scenarios

- [ ] Wallet connection flow
- [ ] Wallet linking (EIP-712)
- [ ] Score calculation accuracy
- [ ] Leaderboard functionality
- [ ] UI/UX feedback
- [ ] Tier assignment verification
- [ ] Mobile responsiveness

#### Collect Feedback

- [ ] Daily check-ins with testers
- [ ] Gather bug reports
- [ ] Collect feature requests
- [ ] Document common issues

---

## 📋 Quick Reference Checklist

### Before Production Deployment

- [ ] Database set up and migrations run
- [ ] Smart contract deployed to Base mainnet
- [ ] All environment variables configured
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Preview deployment tested

### After Production Deployment

- [ ] Health endpoint verified
- [ ] All API endpoints working
- [ ] Wallet connection functional
- [ ] Monitoring set up
- [ ] Alerts configured

### Before Public Launch

- [ ] Data source integration tested
- [ ] Score calculations validated
- [ ] Beta testing completed
- [ ] Critical bugs fixed
- [ ] Documentation updated

---

## 🚨 Critical Path

**Must Complete Before Launch:**
1. ✅ Database setup (Day 1-2)
2. ✅ Contract deployment (Day 2-3)
3. ✅ Environment configuration (Day 3-4)
4. ✅ Vercel deployment (Day 4-5)
5. ✅ Basic testing (Day 5-7)

**Can Run in Parallel:**

- Monitoring setup
- Data source testing
- Beta tester recruitment

---

## 📞 Support Resources

- **Deployment Issues:** See [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)
- **Database Issues:** See [Production Checklist](./deployment/PRODUCTION_CHECKLIST.md)
- **Code Issues:** See [Project Status](./PROJECT_STATUS.md)

---

**Next Review:** After Phase 1 completion (Day 7)
