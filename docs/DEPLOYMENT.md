# BaseRank Protocol - Deployment Guide

## Prerequisites

- Node.js 20+
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- Python 3.10+ (for Agent)
- PostgreSQL database (Railway recommended)

---

## 1. Smart Contract Deployment

```bash
cd foundry

# Install dependencies
forge install Vectorized/solady
forge install OpenZeppelin/openzeppelin-contracts

# Run tests
forge test -vvv

# Deploy to Base Sepolia (testnet)
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY

# Deploy to Base Mainnet
forge script script/Deploy.s.sol \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

Save the deployed contract address as `REGISTRY_ADDRESS`.

---

## 2. Ponder Indexer Deployment (Railway)

```bash
cd apps/indexer

# Install dependencies
npm install

# Create Railway project
railway login
railway init

# Add PostgreSQL
railway add -d postgres

# Set environment variables
railway variables set PONDER_RPC_URL_8453=https://mainnet.base.org
railway variables set PONDER_RPC_URL_7777777=https://rpc.zora.energy
railway variables set REPUTATION_REGISTRY_ADDRESS=0x...your-address

# Deploy
railway up
```

Copy the Railway URL as `PONDER_URL`.

---

## 3. Agent Deployment (Railway)

```bash
cd apps/agent

# Create Railway service
railway add

# Set environment variables
railway variables set DATABASE_URL=$PONDER_DATABASE_URL
railway variables set REGISTRY_ADDRESS=0x...
railway variables set RPC_URL=https://mainnet.base.org
railway variables set CHAIN_ID=8453
railway variables set CDP_API_KEY_NAME=...
railway variables set CDP_API_KEY_PRIVATE_KEY=...

# Deploy
railway up
```

---

## 4. Frontend Deployment (Vercel)

```bash
# From root directory
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_BASE_RPC_URL
# - NEXT_PUBLIC_REGISTRY_ADDRESS
# - NEXT_PUBLIC_ONCHAINKIT_API_KEY
# - PONDER_URL (Railway URL)
```

Or link your GitHub repository and Vercel will auto-deploy.

---

## 5. Farcaster Frame Setup

Update `public/.well-known/farcaster.json`:

1. Generate account association signature (see [Farcaster docs](https://docs.farcaster.xyz/reference/frames/spec))
2. Update `homeUrl` to your Vercel domain
3. Update image URLs to your hosted assets

Example:
```json
{
  "accountAssociation": {
    "header": "YOUR_ENCODED_HEADER",
    "payload": "YOUR_ENCODED_PAYLOAD",
    "signature": "YOUR_SIGNATURE"
  },
  "frame": {
    "version": "1",
    "name": "BaseRank Protocol",
    "iconUrl": "https://your-domain.vercel.app/icon.png",
    "homeUrl": "https://your-domain.vercel.app",
    "splashImageUrl": "https://your-domain.vercel.app/splash.png",
    "splashBackgroundColor": "#000000"
  }
}
```

---

## Environment Variables Summary

### Frontend (.env.local)

```env
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...your-deployed-address
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-onchainkit-key
PONDER_URL=https://your-indexer.railway.app
```

### Indexer (.env)

```env
DATABASE_URL=postgresql://...railway-postgres-url
PONDER_RPC_URL_8453=https://mainnet.base.org
PONDER_RPC_URL_7777777=https://rpc.zora.energy
REPUTATION_REGISTRY_ADDRESS=0x...your-deployed-address
```

### Agent (.env)

```env
DATABASE_URL=postgresql://...same-as-indexer
REGISTRY_ADDRESS=0x...your-deployed-address
RPC_URL=https://mainnet.base.org
CHAIN_ID=8453
CDP_API_KEY_NAME=your-cdp-key-name
CDP_API_KEY_PRIVATE_KEY=your-cdp-private-key
AGENT_INTERVAL_MINUTES=60
BATCH_SIZE=50
LOG_LEVEL=INFO
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                        │
│                  Next.js 15 + OnchainKit + wagmi                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Routes (/api/*)                          │
│              Fetch from Ponder or return mock data              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Ponder Indexer (Railway)                      │
│        Indexes Base + Zora events → PostgreSQL                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Railway)                        │
│            accounts, linked_wallets, zora_mints                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent (Railway / Cron)                       │
│   Reads DB → Calculates Scores → Writes to Chain via CDP        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ReputationRegistry (Base Mainnet)                 │
│          On-chain storage of scores, tiers, wallet links        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verification Checklist

- [ ] Smart contract deployed and verified on Basescan
- [ ] Ponder indexer running and syncing
- [ ] PostgreSQL database accessible
- [ ] Agent running with CDP credentials
- [ ] Frontend deployed and connected to indexer
- [ ] Farcaster Frame manifest configured
- [ ] Domain added to Frame allowlist

---

## Troubleshooting

### Contract Verification Failed

```bash
# Verify manually
forge verify-contract \
  --chain-id 8453 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.23 \
  0xYOUR_CONTRACT_ADDRESS \
  src/ReputationRegistry.sol:ReputationRegistry
```

### Ponder Not Syncing

1. Check RPC URLs are valid
2. Verify contract address is correct
3. Check `startBlock` is before deployment block
4. View logs: `railway logs`

### Agent Not Updating Scores

1. Verify CDP credentials are valid
2. Check agent wallet has ETH for gas
3. Ensure DATABASE_URL matches Ponder's database
4. View logs for errors

### Frame Not Loading

1. Verify `farcaster.json` is accessible at `/.well-known/farcaster.json`
2. Check account association signature is valid
3. Ensure domain matches in payload
4. Test with Warpcast's frame validator

---

## Cost Estimates

| Service | Monthly Cost |
|---------|--------------|
| Railway (Ponder + Postgres) | ~$10-20 |
| Railway (Agent) | ~$5-10 |
| Vercel (Frontend) | Free tier |
| Base Gas | ~$1-5 (batch updates) |

---

## Security Considerations

1. Never commit private keys or API keys
2. Use environment variables for all secrets
3. Agent wallet should have minimal ETH balance
4. Consider using a multisig for contract ownership
5. Rate limit API endpoints in production

---

## Support

- GitHub Issues: [your-repo/issues]
- Discord: [your-discord]
- Farcaster: @your-handle
