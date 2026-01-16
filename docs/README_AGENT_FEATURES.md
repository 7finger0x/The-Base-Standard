# Agent Features - Quick Reference
## The Base Standard

**Status:** ✅ Ready to Use  
**Setup Time:** 5 minutes

---

## 🚀 Quick Setup

### 1. Get Pinata Token
Visit [pinata.cloud](https://pinata.cloud) → API Keys → Create JWT Token

### 2. Add to `.env.local`
```bash
PINATA_JWT_TOKEN=your_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Verify
```bash
npx tsx scripts/check-services.ts
```

---

## 📝 Available Features

### IPFS Storage
- **Store reputation metadata:** `POST /api/storage/ipfs/reputation`
- **Library function:** `storeReputationMetadata()`
- **Test:** `npx tsx scripts/test-ipfs.ts`

### Farcaster Frames
- **Frame page:** `/frame/reputation?address=0x...`
- **Image API:** `/api/frame/reputation?address=0x...`
- **Share in Farcaster:** Copy Frame page URL

### Chainlink Data Feeds
- **Get prices:** `getBasePrice()`, `getETHPrice()`
- **Calculate score:** `calculateEconomicActivityScore()`
- **Library:** `@/lib/chainlink/data-feeds`

---

## 📚 Documentation

- **Quick Start:** `docs/QUICK_START_AGENT.md`
- **Setup Guide:** `docs/AGENT_SETUP_GUIDE.md`
- **Environment Variables:** `docs/ENV_VARIABLES_AGENT.md`
- **Technical Spec:** `docs/AGENT_INTEGRATION_SPEC.md`
- **Architecture:** `docs/WEB3_AGENT_ARCHITECTURE.md`

---

## ✅ Checklist

See `SETUP_CHECKLIST.md` for step-by-step setup.

---

**Last Updated:** January 2026
