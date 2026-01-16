# Agent Integration Setup Guide
## The Base Standard - Quick Start

This guide walks you through setting up the Web3 AI Agent features for The Base Standard.

---

## Prerequisites

1. **Node.js 20+** installed
2. **npm** or **yarn** package manager
3. **Pinata account** (free tier works for development)
4. **Base network** access (testnet or mainnet)

---

## Step 1: Install Dependencies

The agent dependencies have been added to `package.json`. Install them:

```bash
npm install
```

This will install:
- `@pinata/sdk` - IPFS pinning service
- `satori` - Frame image generation
- `@resvg/resvg-js` - SVG to PNG conversion

---

## Step 2: Set Up Pinata (IPFS Storage)

### 2.1 Create Pinata Account

1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email

### 2.2 Generate JWT Token

1. Go to **API Keys** in Pinata dashboard
2. Click **New Key**
3. Select **Admin** permissions
4. Copy the **JWT Token**

### 2.3 Add to Environment Variables

Create or update `.env.local`:

```bash
PINATA_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

**Security Note:** Never commit `.env.local` to git!

---

## Step 3: Configure Base URL (For Frames)

Add your application's base URL:

```bash
# Development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Production (replace with your domain)
NEXT_PUBLIC_BASE_URL=https://basestandard.xyz
```

---

## Step 4: Test IPFS Storage

### 4.1 Create Test Script

Create `scripts/test-ipfs.ts`:

```typescript
import { storeReputationMetadata } from '../src/lib/storage/ipfs';

async function test() {
  const cid = await storeReputationMetadata({
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    score: 850,
    tier: 'BASED',
    timestamp: Date.now(),
    linkedWallets: [],
  });
  
  console.log('✅ Stored on IPFS:', cid);
  console.log('🔗 View at:', `https://gateway.pinata.cloud/ipfs/${cid}`);
}

test().catch(console.error);
```

### 4.2 Run Test

```bash
npx tsx scripts/test-ipfs.ts
```

You should see:
- ✅ Success message with CID
- 🔗 Link to view on IPFS gateway

---

## Step 5: Test Farcaster Frame

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Test Frame Image Generation

Visit in browser:
```
http://localhost:3000/api/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

You should see an SVG image with reputation data.

### 5.3 Test Frame Page

Visit:
```
http://localhost:3000/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

This page contains the Frame meta tags that Farcaster uses.

---

## Step 6: Optional - Chainlink Integration

### 6.1 Get Chainlink Contract Addresses

For Base network, get addresses from:
- [Chainlink Functions Docs](https://docs.chain.link/chainlink-functions)
- [Chainlink Automation Docs](https://docs.chain.link/chainlink-automation)

### 6.2 Add to Environment

```bash
CHAINLINK_FUNCTIONS_ROUTER=0x...
CHAINLINK_AUTOMATION_REGISTRY=0x...
```

### 6.3 Test Data Feeds

The Chainlink data feed utilities are ready to use:

```typescript
import { getBasePrice, getETHPrice } from '@/lib/chainlink/data-feeds';

const basePrice = await getBasePrice();
console.log('Base/USD:', basePrice.price);
```

---

## Step 7: Verify Configuration

### 7.1 Check Service Status

Create a test script `scripts/check-services.ts`:

```typescript
import { isServiceConfigured } from '../src/lib/env';

console.log('IPFS:', isServiceConfigured('ipfs') ? '✅' : '❌');
console.log('Chainlink:', isServiceConfigured('chainlink') ? '✅' : '❌');
```

Run:
```bash
npx tsx scripts/check-services.ts
```

### 7.2 Run Tests

```bash
npm run test:run
```

All tests should pass, including the infrastructure test.

---

## Troubleshooting

### "IPFS service not configured" Error

**Problem:** `PINATA_JWT_TOKEN` not set or invalid.

**Solution:**
1. Verify token in Pinata dashboard
2. Check `.env.local` has correct token
3. Restart dev server after adding env var

### Frame Images Not Loading

**Problem:** `NEXT_PUBLIC_BASE_URL` incorrect or not accessible.

**Solution:**
1. For localhost: Use `http://localhost:3000`
2. For production: Use your public domain
3. Ensure URL is accessible (not behind VPN/firewall)

### TypeScript Errors

**Problem:** Missing type definitions.

**Solution:**
```bash
npm install --save-dev @types/node
npm run typecheck
```

---

## Next Steps

1. **Integrate IPFS Storage**
   - Update reputation API to store snapshots on IPFS
   - Add IPFS CID tracking to database

2. **Deploy Frames**
   - Share Frame URL in Farcaster
   - Test transaction buttons

3. **Set Up Chainlink Automation**
   - Deploy updated ReputationRegistry contract
   - Register with Chainlink Automation

4. **Create On-Chain NFTs**
   - Deploy ReputationBadge contract
   - Implement minting API

See `docs/AGENT_INTEGRATION_SPEC.md` for detailed implementation guide.

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `PINATA_JWT_TOKEN` | Yes (for IPFS) | Pinata JWT token for IPFS storage |
| `NEXT_PUBLIC_PINATA_GATEWAY` | No | Custom Pinata gateway (default: gateway.pinata.cloud) |
| `NEXT_PUBLIC_BASE_URL` | Yes (for Frames) | Base URL of your application |
| `CHAINLINK_FUNCTIONS_ROUTER` | No | Chainlink Functions router address |
| `CHAINLINK_AUTOMATION_REGISTRY` | No | Chainlink Automation registry address |

---

## Support

- **Documentation:** See `docs/AGENT_INTEGRATION_SPEC.md`
- **Environment Variables:** See `docs/ENV_VARIABLES_AGENT.md`
- **Architecture:** See `docs/WEB3_AGENT_ARCHITECTURE.md`

---

**Last Updated:** January 2026
