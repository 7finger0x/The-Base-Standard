# BaseRank Protocol - Quick Start Deployment Guide

This guide walks you through deploying the entire BaseRank Protocol stack from scratch.

## 🎯 Overview

You'll deploy 4 main components:
1. **Smart Contract** - ReputationRegistry on Base blockchain
2. **Frontend** - Next.js app on Vercel
3. **Indexer** (Optional) - Ponder data indexer on Railway
4. **Agent** (Optional) - Autonomous score updater on Railway

---

## ⚡ Fast Track (Frontend Only - 5 minutes)

If you just want to get the frontend running with mock data:

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Fill in minimal required variables:
# - NEXT_PUBLIC_REGISTRY_ADDRESS (use existing testnet address)
# - NEXT_PUBLIC_ONCHAINKIT_API_KEY (get from https://portal.cdp.coinbase.com/)
```

### 2. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 - The app will work with mock data!

---

## 🚀 Full Deployment (Production Ready)

### Prerequisites

Install these tools first:

- [Node.js 20+](https://nodejs.org/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) - `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- [Vercel CLI](https://vercel.com/docs/cli) - `npm i -g vercel`
- [Railway CLI](https://docs.railway.app/develop/cli) (Optional) - `npm i -g @railway/cli`
- A crypto wallet with some Base Sepolia ETH (or Base mainnet ETH)

---

## Step 1: Deploy Smart Contract (15 minutes)

### 1.1 Prepare Deployment Wallet

```bash
# Generate a new private key (or use existing)
cast wallet new

# Save the private key securely
# Fund this wallet with Base Sepolia ETH from https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

### 1.2 Configure Environment

```bash
cd foundry

# Create .env file
cat > .env << 'EOF'
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_api_key_here
EOF

# Get Etherscan API key from https://basescan.org/myapikey
```

### 1.3 Install Dependencies & Test

```bash
# Install Solidity dependencies
forge install

# Run tests to ensure everything works
forge test -vvv

# Should see output like:
# Running 3 tests for test/ReputationRegistry.t.sol:ReputationRegistryTest
# [PASS] testLinkWallet() (gas: 123456)
# [PASS] testCalculateTier() (gas: 12345)
# Test result: ok. 3 passed; 0 failed;
```

### 1.4 Deploy Contract

```bash
# Deploy to Base Sepolia (testnet)
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv

# For Base Mainnet (production), use:
# forge script script/Deploy.s.sol \
#   --rpc-url https://mainnet.base.org \
#   --private-key $PRIVATE_KEY \
#   --broadcast \
#   --verify \
#   -vvvv
```

### 1.5 Save Contract Address

After deployment, you'll see:
```
== Logs ==
  Deployed ReputationRegistry at: 0xYourContractAddressHere
```

**IMPORTANT: Copy this address!** You'll need it for the frontend.

Verify on BaseScan:
- Testnet: https://sepolia.basescan.org/address/0xYourContractAddressHere
- Mainnet: https://basescan.org/address/0xYourContractAddressHere

---

## Step 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Get Required API Keys

1. **OnchainKit API Key**
   - Go to https://portal.cdp.coinbase.com/
   - Create a new project
   - Copy the API key

2. **WalletConnect Project ID** (Optional but recommended)
   - Go to https://cloud.walletconnect.com/
   - Create a project
   - Copy the Project ID

### 2.2 Configure Environment Variables

```bash
# From project root
cp .env.example .env.local

# Edit .env.local with your values:
cat > .env.local << 'EOF'
# Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# Your deployed contract address from Step 1.5
NEXT_PUBLIC_REGISTRY_ADDRESS=0xYourContractAddressHere

# API Keys
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Optional: Ponder indexer URL (leave empty for now)
NEXT_PUBLIC_PONDER_URL=
EOF
```

### 2.3 Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test:
- Connect your wallet
- Check that it shows your score (will be mock data initially)
- Try the wallet linking flow

### 2.4 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [your account]
# - Link to existing project? N
# - Project name: baserank-protocol
# - Directory: ./
# - Override settings? N

# Set production environment variables
vercel env add NEXT_PUBLIC_BASE_RPC_URL production
vercel env add NEXT_PUBLIC_CHAIN_ID production
vercel env add NEXT_PUBLIC_REGISTRY_ADDRESS production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add Environment Variables (from your .env.local)
5. Click "Deploy"

### 2.5 Verify Deployment

Visit your Vercel URL (e.g., `https://baserank-protocol.vercel.app`)
- Connect wallet
- View reputation score
- Test wallet linking

---

## Step 3: Deploy Ponder Indexer (Optional - 20 minutes)

The indexer enables real score calculation. Without it, the app uses mock data.

### 3.1 Setup Railway Account

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize new project
cd apps/indexer
railway init
```

### 3.2 Add PostgreSQL Database

```bash
# Add Postgres to your Railway project
railway add -d postgres

# Get database URL
railway variables get DATABASE_URL
```

### 3.3 Configure Indexer

```bash
# Create .env file in apps/indexer
cat > apps/indexer/.env << 'EOF'
# Railway will auto-inject DATABASE_URL

# RPC URLs for indexing
PONDER_RPC_URL_8453=https://mainnet.base.org
PONDER_RPC_URL_7777777=https://rpc.zora.energy

# Your contract address
REPUTATION_REGISTRY_ADDRESS=0xYourContractAddressHere
EOF
```

### 3.4 Update Ponder Config

Check `apps/indexer/ponder.config.ts` and verify:
- Contract address matches your deployment
- Start block is before your deployment block
- RPC URLs are correct

### 3.5 Deploy to Railway

```bash
cd apps/indexer

# Set environment variables in Railway
railway variables set PONDER_RPC_URL_8453=https://mainnet.base.org
railway variables set PONDER_RPC_URL_7777777=https://rpc.zora.energy
railway variables set REPUTATION_REGISTRY_ADDRESS=0xYourContractAddressHere

# Deploy
railway up

# Get deployment URL
railway domain
```

### 3.6 Update Frontend

Add the Ponder URL to your Vercel environment variables:

```bash
# Using CLI
vercel env add NEXT_PUBLIC_PONDER_URL production
# Enter: https://your-indexer.railway.app

# Or add in Vercel dashboard:
# Settings > Environment Variables > Add
```

Redeploy frontend:
```bash
vercel --prod
```

---

## Step 4: Deploy Agent (Optional - 20 minutes)

The agent autonomously calculates and updates scores on-chain.

### 4.1 Get CDP API Credentials

1. Go to https://portal.cdp.coinbase.com/
2. Create API credentials for AgentKit
3. Save `CDP_API_KEY_NAME` and `CDP_API_KEY_PRIVATE_KEY`

### 4.2 Setup Agent on Railway

```bash
cd apps/agent

# Initialize Railway service
railway init

# Set environment variables
railway variables set DATABASE_URL=your_ponder_database_url
railway variables set REGISTRY_ADDRESS=0xYourContractAddressHere
railway variables set RPC_URL=https://mainnet.base.org
railway variables set CHAIN_ID=8453
railway variables set CDP_API_KEY_NAME=your_cdp_key_name
railway variables set CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key
railway variables set AGENT_INTERVAL_MINUTES=60
railway variables set BATCH_SIZE=50

# Deploy
railway up
```

### 4.3 Verify Agent

Check Railway logs:
```bash
railway logs

# Should see:
# Agent started. Running every 60 minutes...
# Fetching accounts to update...
# Calculated score for 0x123...: 450
```

---

## 🎉 Deployment Complete!

Your full stack is now live:

- ✅ Smart contract deployed on Base
- ✅ Frontend live on Vercel
- ✅ Indexer syncing data (optional)
- ✅ Agent updating scores (optional)

## 📊 Monitoring

### Check Smart Contract
- BaseScan: https://basescan.org/address/0xYourAddress
- View transactions, events, and storage

### Check Frontend
- Visit your Vercel URL
- Connect wallet and view scores
- Check leaderboard

### Check Indexer (if deployed)
- Railway Dashboard: https://railway.app/dashboard
- View logs: `railway logs`
- Check database: `railway run psql`

### Check Agent (if deployed)
- Railway logs: `railway logs`
- Verify on-chain updates on BaseScan

---

## 🔧 Troubleshooting

### Contract Deployment Failed

**Problem**: Transaction reverted or gas estimation failed

**Solutions**:
```bash
# Check wallet balance
cast balance $YOUR_ADDRESS --rpc-url $SEPOLIA_RPC

# Increase gas limit
forge script script/Deploy.s.sol --gas-limit 3000000 --broadcast

# Verify RPC is working
cast block latest --rpc-url $SEPOLIA_RPC
```

### Frontend Build Failed

**Problem**: Build errors during Vercel deployment

**Solutions**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run typecheck

# Check for linting errors
npm run lint
```

### Ponder Not Syncing

**Problem**: Indexer shows no data or stuck at block 0

**Solutions**:
1. Check `startBlock` in `ponder.config.ts` - must be <= deployment block
2. Verify RPC URLs are accessible: `curl https://mainnet.base.org`
3. Check logs: `railway logs --tail 100`
4. Restart: `railway restart`

### Agent Not Updating Scores

**Problem**: No on-chain transactions from agent

**Solutions**:
1. Verify CDP credentials are valid
2. Check agent wallet has ETH for gas
3. Verify DATABASE_URL points to same DB as Ponder
4. Check logs: `railway logs --tail 100`
5. Ensure contract address is correct

### Wallet Connection Issues

**Problem**: Can't connect wallet in frontend

**Solutions**:
1. Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
2. Check network matches contract deployment (testnet vs mainnet)
3. Clear browser cache and localStorage
4. Try different wallet (Coinbase Wallet, MetaMask, WalletConnect)

---

## 💰 Cost Breakdown

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Vercel (Frontend) | **Free** (Hobby tier) |
| Railway Postgres | **$5** (512MB RAM) |
| Railway Ponder | **$5-10** (small instance) |
| Railway Agent | **$5** (small instance) |
| Base Gas Fees | **$1-5** (batch updates) |
| **Total** | **~$16-25/month** |

### Cost Optimization Tips
- Use Vercel free tier (enough for most projects)
- Railway credits: $5/month free
- Batch agent updates to minimize gas
- Use testnet (free) for development

---

## 🔒 Security Checklist

Before going to production:

- [ ] Never commit `.env` files to Git
- [ ] Rotate any exposed private keys immediately
- [ ] Use separate wallets for deployment vs agent
- [ ] Fund agent wallet with minimal ETH (0.01-0.05 ETH)
- [ ] Set up monitoring/alerts for agent wallet balance
- [ ] Enable Vercel environment variable encryption
- [ ] Use Railway's secret management
- [ ] Review smart contract with audit (for mainnet)
- [ ] Add rate limiting to API routes
- [ ] Set up error monitoring (Sentry, LogRocket)

---

## 📚 Next Steps

### Customize Your Deployment

1. **Update Branding**
   - Edit `src/app/layout.tsx` - Update title, description
   - Replace logo in `public/logo.png`
   - Update social cards in `public/og-image.png`

2. **Adjust Score Algorithm**
   - Edit `apps/agent/score_calculator.py`
   - Modify weights and calculation logic
   - Test with `python score_calculator.py`

3. **Add Features**
   - Implement badge minting (TODO in agent)
   - Add leaderboard prizes
   - Create achievement system

### Mainnet Deployment

When ready for mainnet:

1. Deploy contract to Base mainnet (Step 1.4 with mainnet RPC)
2. Update all environment variables to mainnet
3. Point indexer to mainnet RPC
4. Fund agent wallet with mainnet ETH
5. Update frontend environment to mainnet
6. Test thoroughly before announcing

---

## 🆘 Getting Help

- 📖 Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed architecture
- 🐛 Check [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Join community Discord (if available)
- 📧 Contact: your-email@example.com

---

## ✅ Deployment Verification Checklist

Use this checklist to ensure everything is working:

### Smart Contract
- [ ] Contract deployed and verified on BaseScan
- [ ] Can view contract code on BaseScan
- [ ] Test transactions work (link wallet, update score)
- [ ] Owner address is correct

### Frontend
- [ ] Site loads on Vercel URL
- [ ] Wallet connection works
- [ ] Shows reputation score (mock or real)
- [ ] Leaderboard displays
- [ ] Wallet linking flow works
- [ ] Mobile responsive
- [ ] No console errors

### Indexer (Optional)
- [ ] Ponder is syncing blocks
- [ ] Database has data
- [ ] API endpoints return data
- [ ] Frontend shows real (not mock) data

### Agent (Optional)
- [ ] Agent is running (check logs)
- [ ] Scores are calculated correctly
- [ ] Transactions appear on BaseScan
- [ ] Batch updates working

---

**Congratulations! Your BaseRank Protocol is live! 🎉**

Share your deployment:
- Twitter: "Just deployed my on-chain reputation system with @base! Check it out: [your-url]"
- Farcaster: Share your Frame
- GitHub: Add deployment URL to README
