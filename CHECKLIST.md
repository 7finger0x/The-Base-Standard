# BaseRank Deployment Checklist

Use this checklist to track your deployment progress.

## 📋 Pre-Deployment Setup

### Development Environment
- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm/pnpm installed
- [ ] Git installed and configured
- [ ] Code editor setup (VS Code recommended)

### Accounts & Services
- [ ] Crypto wallet with private key saved securely
- [ ] Base Sepolia ETH obtained (testnet) or Base ETH (mainnet)
- [ ] Coinbase Developer Platform account (https://portal.cdp.coinbase.com/)
- [ ] Vercel account (https://vercel.com/)
- [ ] Railway account (https://railway.app/) - Optional
- [ ] BaseScan API key (https://basescan.org/myapikey)

### API Keys Obtained
- [ ] OnchainKit API Key (from Coinbase Portal)
- [ ] WalletConnect Project ID (from https://cloud.walletconnect.com/)
- [ ] Etherscan API Key (for contract verification)
- [ ] CDP AgentKit credentials (if deploying agent)

---

## 🔧 Step 1: Smart Contract Deployment

### Preparation
- [ ] Foundry installed (`forge --version`)
- [ ] Created `foundry/.env` file
- [ ] Added `PRIVATE_KEY` to foundry/.env
- [ ] Added `SEPOLIA_RPC` to foundry/.env
- [ ] Added `ETHERSCAN_API_KEY` to foundry/.env
- [ ] Wallet funded with Base Sepolia ETH

### Build & Test
- [ ] Ran `forge install` successfully
- [ ] Ran `forge build` successfully
- [ ] Ran `forge test -vvv` - all tests passing
- [ ] No compilation warnings or errors

### Deploy
- [ ] Executed deploy script
- [ ] Transaction confirmed on blockchain
- [ ] Contract address saved
- [ ] Contract verified on BaseScan
- [ ] Can view contract source on BaseScan

### Contract Address
```
Deployed at: 0x________________________________
Network: Base Sepolia / Base Mainnet
Block: ________
Tx Hash: 0x________________________________
BaseScan: https://basescan.org/address/0x________________________________
```

---

## 🎨 Step 2: Frontend Deployment

### Local Setup
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_BASE_RPC_URL`
- [ ] Added `NEXT_PUBLIC_CHAIN_ID`
- [ ] Added `NEXT_PUBLIC_REGISTRY_ADDRESS` (from Step 1)
- [ ] Added `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- [ ] Added `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Local Testing
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run dev` - server starts
- [ ] Opened http://localhost:3000 - page loads
- [ ] Connected wallet successfully
- [ ] Viewed reputation score (mock data OK for now)
- [ ] Tested wallet linking modal
- [ ] No console errors in browser
- [ ] Ran `npm run build` successfully
- [ ] Ran `npm run typecheck` - no errors
- [ ] Ran `npm run lint` - no critical errors

### Vercel Deployment
- [ ] Created Vercel account
- [ ] Installed Vercel CLI (`vercel --version`)
- [ ] Logged in (`vercel login`)
- [ ] Created new project (`vercel`)
- [ ] Added environment variables to Vercel
  - [ ] NEXT_PUBLIC_BASE_RPC_URL
  - [ ] NEXT_PUBLIC_CHAIN_ID
  - [ ] NEXT_PUBLIC_REGISTRY_ADDRESS
  - [ ] NEXT_PUBLIC_ONCHAINKIT_API_KEY
  - [ ] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- [ ] Deployed to production (`vercel --prod`)
- [ ] Deployment successful
- [ ] Site accessible via Vercel URL

### Production Testing
- [ ] Visited Vercel production URL
- [ ] Site loads correctly
- [ ] Wallet connects
- [ ] Reputation score displays
- [ ] Leaderboard works
- [ ] Wallet linking flow works
- [ ] Mobile responsive (test on phone)
- [ ] No console errors

### Production URL
```
Vercel URL: https://________________________________.vercel.app
```

---

## 📊 Step 3: Ponder Indexer (Optional)

### Railway Setup
- [ ] Created Railway account
- [ ] Installed Railway CLI (`railway --version`)
- [ ] Logged in (`railway login`)
- [ ] Created new Railway project
- [ ] Added PostgreSQL database

### Configuration
- [ ] Created `apps/indexer/.env`
- [ ] Database URL configured (auto-injected by Railway)
- [ ] Updated `ponder.config.ts` with contract address
- [ ] Verified `startBlock` is correct
- [ ] Added RPC URLs for Base and Zora
- [ ] Checked contract ABI is up to date

### Deployment
- [ ] Set environment variables in Railway
  - [ ] PONDER_RPC_URL_8453
  - [ ] PONDER_RPC_URL_7777777
  - [ ] REPUTATION_REGISTRY_ADDRESS
- [ ] Deployed with `railway up`
- [ ] Deployment successful
- [ ] Got Railway public URL
- [ ] Indexer is syncing (check logs)
- [ ] Database contains data

### Testing
- [ ] API endpoint responds: `curl https://your-indexer.railway.app/health`
- [ ] Can query reputation: `curl https://your-indexer.railway.app/api/reputation/0xYourAddress`
- [ ] Database has tables (accounts, linked_wallets, zora_mints)
- [ ] No errors in Railway logs

### Update Frontend
- [ ] Added `NEXT_PUBLIC_PONDER_URL` to Vercel env vars
- [ ] Redeployed frontend
- [ ] Frontend now shows real data (not mock)
- [ ] Verify by checking network tab in browser

### Indexer URL
```
Railway URL: https://________________________________.railway.app
Database: Connected to Railway PostgreSQL
Status: Syncing / Synced
```

---

## 🤖 Step 4: Agent Deployment (Optional)

### CDP Setup
- [ ] Obtained CDP API credentials
- [ ] Saved `CDP_API_KEY_NAME`
- [ ] Saved `CDP_API_KEY_PRIVATE_KEY`
- [ ] Agent wallet has ETH for gas

### Railway Setup
- [ ] Created new Railway service for agent
- [ ] Set environment variables
  - [ ] DATABASE_URL (same as Ponder)
  - [ ] REGISTRY_ADDRESS
  - [ ] RPC_URL
  - [ ] CHAIN_ID
  - [ ] CDP_API_KEY_NAME
  - [ ] CDP_API_KEY_PRIVATE_KEY
  - [ ] AGENT_INTERVAL_MINUTES (60 recommended)
  - [ ] BATCH_SIZE (50 recommended)
- [ ] Deployed with `railway up`

### Testing
- [ ] Agent is running (check Railway logs)
- [ ] Logs show "Agent started"
- [ ] Scores are being calculated
- [ ] Transactions appear on BaseScan
- [ ] No errors in logs
- [ ] Batch updates working correctly

### Agent Info
```
Railway URL: https://________________________________.railway.app
Agent Wallet: 0x________________________________
Update Interval: _____ minutes
Status: Running
```

---

## 🔒 Security Verification

### Environment Variables
- [ ] No private keys in Git repository
- [ ] `.env` files in `.gitignore`
- [ ] All secrets use environment variables
- [ ] Vercel env vars marked as sensitive
- [ ] Railway env vars properly configured

### Wallet Security
- [ ] Deployment wallet private key stored securely
- [ ] Agent wallet has minimal ETH (< 0.1 ETH)
- [ ] Deployment wallet backed up
- [ ] No private keys exposed in code or logs

### Smart Contract
- [ ] Contract ownership verified
- [ ] Only authorized addresses can update scores
- [ ] Tested on testnet before mainnet
- [ ] Code reviewed for vulnerabilities
- [ ] Consider audit for mainnet (high-value deployments)

---

## 📈 Monitoring Setup

### Alerts & Notifications
- [ ] Set up Railway notifications
- [ ] Monitor Vercel deployment status
- [ ] Track agent wallet balance
- [ ] Set up error tracking (Sentry, etc.) - Optional
- [ ] Monitor contract events on BaseScan

### Health Checks
- [ ] Frontend: https://your-site.vercel.app (200 OK)
- [ ] Indexer: https://your-indexer.railway.app/health (200 OK)
- [ ] Agent: Railway logs show activity
- [ ] Contract: Recent transactions on BaseScan

---

## 📝 Documentation

### Update Project Files
- [ ] Updated README.md with deployment URLs
- [ ] Added contract addresses to documentation
- [ ] Updated .env.example with correct values
- [ ] Documented any custom changes
- [ ] Created runbook for operations

### Share Your Deployment
- [ ] Add deployment URL to README
- [ ] Update social links
- [ ] Share on Twitter/Farcaster
- [ ] Add to portfolio

---

## ✅ Final Verification

### End-to-End Testing
- [ ] User can visit site
- [ ] User can connect wallet
- [ ] User sees reputation score
- [ ] Score updates after on-chain activity
- [ ] Wallet linking works
- [ ] Leaderboard displays correctly
- [ ] Share functionality works (if applicable)
- [ ] Farcaster Frame works (if applicable)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No memory leaks
- [ ] API responses < 1 second
- [ ] Indexer stays synced

### Browser Testing
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Mobile Safari ✓
- [ ] Mobile Chrome ✓

---

## 🎉 Launch!

### Pre-Launch
- [ ] All checklist items complete
- [ ] Team reviewed deployment
- [ ] Backup plan ready (rollback procedure)
- [ ] Contact info for support

### Announce
- [ ] Tweet deployment
- [ ] Share in communities
- [ ] Update Discord/Telegram
- [ ] Add to DApp directories

### Monitor
- [ ] Watch first hour for errors
- [ ] Check user feedback
- [ ] Monitor gas usage
- [ ] Track indexer sync status

---

## 📊 Deployment Summary

```
Project Name: BaseRank Protocol
Deployed: [DATE]
Network: Base Sepolia / Base Mainnet

CONTRACT:
  Address: 0x________________________________
  BaseScan: https://basescan.org/address/0x________________________________

FRONTEND:
  URL: https://________________________________.vercel.app
  Platform: Vercel

INDEXER:
  URL: https://________________________________.railway.app
  Platform: Railway
  Database: PostgreSQL

AGENT:
  Platform: Railway
  Status: Running
  Interval: 60 minutes

TOTAL COST: ~$___/month
```

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Frontend Issues**
   - Revert deployment in Vercel dashboard
   - Or: `vercel rollback`

2. **Indexer Issues**
   - Restart: `railway restart`
   - Rollback: Deploy previous version

3. **Agent Issues**
   - Stop: Pause Railway service
   - No data loss - can resume later

4. **Contract Issues**
   - Cannot rollback (immutable)
   - Deploy new version if needed
   - Update contract address everywhere

---

**Deployment Status: [ ] Not Started | [ ] In Progress | [ ] Complete**

**Deployed By: _______________**
**Date: _______________**
**Notes: _______________________________________________**
