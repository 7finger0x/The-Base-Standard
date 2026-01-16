# What Needs to Be Done - The Base Standard

**Last Updated**: January 2026  
**Status**: Development Complete - Production Deployment Pending

---

## 🎯 Overview

All code development is **100% complete**. The remaining tasks are configuration, deployment, and optional enhancements.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Configuration

#### Required for Production

- [ ] **`NEXTAUTH_SECRET`**
  - Generate: `openssl rand -base64 32` (or PowerShell equivalent)
  - Set in production environment
  - **Critical**: Must be unique and secure

- [ ] **`NEXTAUTH_URL`**
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
  - Must match your production domain exactly

- [ ] **`DATABASE_URL`**
  - Development: `file:./dev.db` (SQLite)
  - Production: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`

#### Optional but Recommended

- [ ] **`PINATA_JWT_TOKEN`**
  - Get from [Pinata Dashboard](https://app.pinata.cloud/)
  - Required for IPFS storage functionality
  - Without this, IPFS snapshots won't be stored

- [ ] **`NEXT_PUBLIC_BASE_RPC_URL`**
  - Base Mainnet: `https://mainnet.base.org`
  - Or use Alchemy/Infura: `https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`

- [ ] **`NEXT_PUBLIC_CHAIN_ID`**
  - Base Mainnet: `8453`
  - Base Sepolia: `84532`

- [ ] **`NEXT_PUBLIC_REGISTRY_ADDRESS`**
  - Set after deploying `ReputationRegistry` contract
  - Format: `0x...`

- [ ] **`NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS`**
  - Set after deploying `ReputationBadge` contract
  - Format: `0x...`

- [ ] **`CHAINLINK_AUTOMATION_REGISTRY`**
  - Base Mainnet Automation Registry address
  - Get from [Chainlink Docs](https://docs.chain.link/chainlink-automation/supported-networks)
  - Required for Chainlink Automation setup

- [ ] **`ADMIN_API_KEY`**
  - Generate secure random key
  - Used for admin API endpoints
  - Format: Random 32+ character string

#### Feature Flags

- [ ] **`ENABLE_PVC_SCORING`**
  - Set to `true` to enable PVC framework
  - Set to `false` to use legacy scoring

- [ ] **`ENABLE_REQUEST_LOGGING`**
  - Set to `true` for production monitoring
  - Set to `false` to disable detailed logging

---

### 2. Database Setup

- [ ] **Run Prisma Migration**
  ```bash
  npm run db:migrate
  ```
  - Creates `ReputationSnapshot` table
  - Creates `ReputationBadge` table
  - Adds indexes for performance

- [ ] **Verify Database Connection**
  ```bash
  npm run db:studio
  ```
  - Open Prisma Studio
  - Verify tables exist
  - Test connection

- [ ] **Seed Initial Data** (Optional)
  - Create test users if needed
  - Add initial reputation scores

---

### 3. Smart Contract Deployment

#### Deploy ReputationRegistry

- [ ] **Get Base RPC URL**
  - Use Alchemy, Infura, or public RPC
  - Set in `.env` as `BASE_RPC_URL`

- [ ] **Get Private Key**
  - Deployer wallet private key
  - **Security**: Use environment variable, never commit

- [ ] **Deploy Contract**
  ```bash
  cd foundry
  forge script script/Deploy.s.sol \
    --rpc-url $BASE_RPC_URL \
    --broadcast \
    --verify \
    --private-key $PRIVATE_KEY
  ```

- [ ] **Set Automation Registry** (if not set during deployment)
  ```bash
  cast send $REGISTRY_ADDRESS \
    "setAutomationRegistry(address)" \
    $CHAINLINK_AUTOMATION_REGISTRY \
    --rpc-url $BASE_RPC_URL \
    --private-key $PRIVATE_KEY
  ```

- [ ] **Save Contract Address**
  - Copy deployed address
  - Set `NEXT_PUBLIC_REGISTRY_ADDRESS` in environment

#### Deploy ReputationBadge

- [ ] **Deploy Badge Contract**
  ```bash
  export REPUTATION_REGISTRY_ADDRESS=0x... # From previous step
  export BADGE_AUTHORIZED_MINTER=0x... # Optional: for automated minting
  
  forge script script/DeployBadge.s.sol \
    --rpc-url $BASE_RPC_URL \
    --broadcast \
    --verify \
    --private-key $PRIVATE_KEY
  ```

- [ ] **Save Badge Contract Address**
  - Copy deployed address
  - Set `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS` in environment

---

### 4. Chainlink Automation Setup

- [ ] **Get LINK Tokens**
  - Acquire LINK on Base network
  - Minimum: 5-10 LINK for testing
  - Production: 10-20 LINK recommended

- [ ] **Register Upkeep via UI**
  - Follow: `docs/CHAINLINK_AUTOMATION_UI_GUIDE.md`
  - Or use: `docs/CHAINLINK_AUTOMATION_SETUP.md`
  - Select "Custom logic" trigger
  - Set gas limit: 500000
  - Starting balance: 5-20 LINK

- [ ] **Verify Upkeep Registration**
  - Check upkeep status in dashboard
  - Verify balance is sufficient
  - Test with single address update

---

### 5. Application Deployment

#### Option A: Vercel (Recommended)

- [ ] **Install Vercel CLI**
  ```bash
  npm install -g vercel
  ```

- [ ] **Link Project**
  ```bash
  vercel link
  ```

- [ ] **Set Environment Variables in Vercel**
  - Go to Vercel Dashboard → Project → Settings → Environment Variables
  - Add all required variables from checklist above
  - Set for: Production, Preview, Development

- [ ] **Deploy to Preview**
  ```bash
  vercel
  ```
  - Test preview deployment
  - Verify all endpoints work

- [ ] **Deploy to Production**
  ```bash
  vercel --prod
  ```

- [ ] **Verify Production Deployment**
  - Test health endpoint: `https://your-domain.com/api/health`
  - Test reputation endpoint: `https://your-domain.com/api/reputation?address=0x...`
  - Test frame endpoint: `https://your-domain.com/frame/reputation?address=0x...`

#### Option B: Docker

- [ ] **Build Docker Image**
  ```bash
  docker build -t base-standard:latest .
  ```

- [ ] **Run Container**
  ```bash
  docker run -p 3000:3000 \
    -e DATABASE_URL=$DATABASE_URL \
    -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    # ... add all environment variables
    base-standard:latest
  ```

---

### 6. Post-Deployment Verification

- [ ] **Health Check**
  ```bash
  curl https://your-domain.com/api/health
  ```
  - Verify all services are healthy
  - Check database connection
  - Verify RPC endpoints

- [ ] **API Endpoints**
  - [ ] `/api/reputation?address=0x...` - Returns reputation data
  - [ ] `/api/leaderboard` - Returns leaderboard
  - [ ] `/api/health` - Returns health status
  - [ ] `/api/identity/me?address=0x...` - Returns identity data

- [ ] **Farcaster Frame**
  - [ ] Frame image loads: `/api/frame/reputation?address=0x...`
  - [ ] Frame meta tags work: `/frame/reputation?address=0x...`
  - [ ] Transaction buttons work
  - [ ] Badge minting works

- [ ] **Smart Contract Integration**
  - [ ] Can read from ReputationRegistry
  - [ ] Can mint ReputationBadge NFTs
  - [ ] Chainlink Automation is active

---

### 7. Testing & Monitoring

- [ ] **End-to-End Testing**
  - Test wallet connection
  - Test reputation score display
  - Test badge minting
  - Test frame interactions

- [ ] **Performance Testing**
  - Load test API endpoints
  - Verify response times
  - Check database query performance

- [ ] **Set Up Monitoring**
  - Configure error tracking (Sentry, etc.)
  - Set up uptime monitoring
  - Configure alerts for:
    - API errors
    - Database connection issues
    - Low Chainlink upkeep balance

- [ ] **Set Up Logging**
  - Configure log aggregation
  - Set up log retention
  - Monitor for errors

---

## 🔧 Optional Enhancements

### Data Source Integrations

These are currently using mock data. Can be implemented incrementally:

- [ ] **Base RPC Integration**
  - Replace mock transaction history
  - Query actual on-chain transactions
  - File: `src/lib/scoring/metrics-collector.ts` (Line 103)

- [ ] **Zora API Integration**
  - Replace mock mint history
  - Query actual Zora API
  - File: `src/lib/scoring/metrics-collector.ts` (Line 118)

- [ ] **Farcaster Hub API**
  - Replace mock FID/OpenRank
  - Query actual Farcaster Hub
  - File: `src/lib/scoring/metrics-collector.ts` (Line 131)

- [ ] **EAS Attestations**
  - Replace mock Coinbase verification
  - Query actual EAS attestations
  - File: `src/lib/scoring/metrics-collector.ts` (Line 143)

- [ ] **Gitcoin Passport**
  - Replace mock passport score
  - Query actual Gitcoin Passport API
  - File: `src/lib/scoring/metrics-collector.ts` (Line 144)

- [ ] **Liquidity Position Parsing**
  - Replace mock LP events
  - Parse actual LP events from chain
  - File: `src/lib/scoring/metrics-collector.ts` (Line 271)

- [ ] **Protocol Category Mapping**
  - Replace mock protocol registry
  - Create actual protocol registry
  - File: `src/lib/scoring/metrics-collector.ts` (Line 307)

- [ ] **USD Conversion**
  - Replace mock price oracle
  - Integrate Chainlink price feeds
  - File: `src/lib/scoring/metrics-collector.ts` (Line 391)

- [ ] **Onchain Summer Badges**
  - Replace mock badge contracts
  - Query actual badge contracts
  - File: `src/lib/scoring/metrics-collector.ts` (Line 1027)

- [ ] **Hackathon Participation**
  - Replace mock hackathon records
  - Query actual hackathon records
  - File: `src/lib/scoring/metrics-collector.ts` (Line 1028)

---

## 📋 Quick Start Checklist

For a quick production deployment, focus on these critical items:

1. ✅ **Environment Variables** (15 min)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
   - Contract addresses (after deployment)

2. ✅ **Database Migration** (5 min)
   ```bash
   npm run db:migrate
   ```

3. ✅ **Deploy Contracts** (30 min)
   - ReputationRegistry
   - ReputationBadge

4. ✅ **Deploy Application** (15 min)
   - Vercel or Docker
   - Set environment variables

5. ✅ **Verify Deployment** (15 min)
   - Test endpoints
   - Verify contracts

**Total Time**: ~1.5 hours for basic production deployment

---

## 🚨 Critical Security Items

Before going to production:

- [ ] **`NEXTAUTH_SECRET`** is set and secure
- [ ] **Private keys** are never committed to git
- [ ] **Environment variables** are set in production (not in code)
- [ ] **Database credentials** are secure
- [ ] **API keys** are rotated regularly
- [ ] **CORS** is configured correctly
- [ ] **Rate limiting** is enabled
- [ ] **Input validation** is working (Zod schemas)

---

## 📚 Documentation References

- **Chainlink Automation Setup**: `docs/CHAINLINK_AUTOMATION_SETUP.md`
- **Chainlink Automation UI Guide**: `docs/CHAINLINK_AUTOMATION_UI_GUIDE.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Environment Variables**: `docs/ENV_VARIABLES.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`

---

## 🎯 Priority Order

### Must Do (Before Production)
1. Environment variables
2. Database migration
3. Contract deployment
4. Application deployment
5. Basic verification

### Should Do (For Full Functionality)
6. Chainlink Automation setup
7. IPFS configuration (Pinata)
8. End-to-end testing
9. Monitoring setup

### Nice to Have (Optional)
10. Data source integrations
11. Performance optimization
12. Advanced monitoring

---

## ✅ Completion Status

- **Code Development**: ✅ 100% Complete
- **Configuration**: ⚠️ User Action Required
- **Deployment**: ⚠️ User Action Required
- **Testing**: ⚠️ User Action Required
- **Monitoring**: ⚠️ User Action Required

---

**Next Step**: Start with "1. Environment Variables Configuration" above.
