# Environment Variables - Agent Integration
## The Base Standard

This document lists all environment variables required for Web3 AI Agent features.

---

## IPFS / Pinata Storage

### `PINATA_JWT_TOKEN` (Required for IPFS features)

**Description:** JWT token for Pinata IPFS pinning service.

**How to get:**
1. Sign up at [Pinata](https://pinata.cloud)
2. Go to API Keys section
3. Create a new JWT token
4. Copy the token

**Example:**
```bash
PINATA_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security:** 
- ⚠️ **NEVER** commit this to git
- Store in `.env.local` for development
- Use Vercel/Environment secrets for production

---

### `NEXT_PUBLIC_PINATA_GATEWAY` (Optional)

**Description:** Custom Pinata gateway domain for IPFS content.

**Default:** `gateway.pinata.cloud`

**Example:**
```bash
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
# Or use custom domain:
NEXT_PUBLIC_PINATA_GATEWAY=ipfs.yourdomain.com
```

**Note:** If you have a paid Pinata plan, you can use a custom domain.

---

## Chainlink Integration

### `CHAINLINK_FUNCTIONS_ROUTER` (Optional)

**Description:** Chainlink Functions router contract address on Base.

**Example:**
```bash
CHAINLINK_FUNCTIONS_ROUTER=0x...
```

**Note:** Get the address from [Chainlink Docs](https://docs.chain.link/chainlink-functions)

---

### `CHAINLINK_AUTOMATION_REGISTRY` (Optional)

**Description:** Chainlink Automation registry contract address on Base.

**Example:**
```bash
CHAINLINK_AUTOMATION_REGISTRY=0x...
```

**Note:** Get the address from [Chainlink Docs](https://docs.chain.link/chainlink-automation)

---

## Farcaster Frames

### `NEXT_PUBLIC_BASE_URL` (Required for Frames)

**Description:** Base URL of your application (used for Frame meta tags).

**Development:**
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Production:**
```bash
NEXT_PUBLIC_BASE_URL=https://basestandard.xyz
```

**Note:** Must be publicly accessible for Farcaster to fetch Frame images.

---

## Complete .env.local Example

```bash
# Existing variables
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...

# IPFS / Pinata
PINATA_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# Chainlink (Optional - for autonomous updates)
CHAINLINK_FUNCTIONS_ROUTER=0x...
CHAINLINK_AUTOMATION_REGISTRY=0x...

# Farcaster Frames
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Validation

The environment variables are automatically validated using Zod schemas in `src/lib/env.ts`.

To check if services are configured:

```typescript
import { isServiceConfigured } from '@/lib/env';

if (isServiceConfigured('ipfs')) {
  // IPFS features available
}

if (isServiceConfigured('chainlink')) {
  // Chainlink features available
}
```

---

## Production Setup

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy after adding variables

### Railway / Other Platforms

1. Add variables in platform dashboard
2. Restart service after adding variables

---

## Troubleshooting

### "IPFS service not configured" error

**Solution:** Set `PINATA_JWT_TOKEN` environment variable.

### Frame images not loading

**Solution:** 
1. Check `NEXT_PUBLIC_BASE_URL` is set correctly
2. Ensure URL is publicly accessible (not localhost in production)
3. Check Frame API route is working: `/api/frame/reputation?address=0x...`

### Chainlink functions not working

**Solution:**
1. Verify contract addresses are correct for Base network
2. Check you have LINK tokens for Chainlink Functions
3. Ensure contracts are deployed and registered

---

**Last Updated:** January 2026
