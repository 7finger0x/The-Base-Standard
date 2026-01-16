# Agent Features Setup Checklist
## The Base Standard

Use this checklist to quickly set up agent features.

---

## ✅ Environment Variables Setup

### Step 1: Get Pinata Token
- [ ] Go to [pinata.cloud](https://pinata.cloud)
- [ ] Sign up / Log in
- [ ] Navigate to **API Keys** → **New Key**
- [ ] Select **Admin** permissions
- [ ] Copy **JWT Token**

### Step 2: Add to .env.local
- [ ] Create/update `.env.local` in project root
- [ ] Add `PINATA_JWT_TOKEN=your_token_here`
- [ ] Add `NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud`
- [ ] Add `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

### Step 3: Verify
- [ ] Run: `npx tsx scripts/check-services.ts`
- [ ] Should show: `✅ IPFS (Pinata): Configured`

---

## ✅ Test IPFS Storage

- [ ] Run: `npx tsx scripts/test-ipfs.ts`
- [ ] Should see: `✅ Successfully stored on IPFS!`
- [ ] Copy the CID and gateway URL
- [ ] Visit gateway URL in browser to verify

---

## ✅ Test Farcaster Frame

- [ ] Start dev server: `npm run dev`
- [ ] Visit: `http://localhost:3000/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- [ ] Should see Frame page with meta tags
- [ ] Visit: `http://localhost:3000/api/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- [ ] Should see SVG image with reputation data

---

## ✅ Test API Endpoint

- [ ] Test IPFS storage API:
  ```bash
  curl -X POST http://localhost:3000/api/storage/ipfs/reputation \
    -H "Content-Type: application/json" \
    -d '{
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "score": 850,
      "tier": "BASED",
      "timestamp": 1704067200000
    }'
  ```
- [ ] Should return: `{"success": true, "data": {"cid": "...", ...}}`

---

## ✅ Run Tests

- [ ] Run: `npm run test:run`
- [ ] All tests should pass
- [ ] Check infrastructure test: `npm run test:run -- tests/test-infrastructure.test.ts`

---

## 📚 Documentation

- [ ] Read: `docs/QUICK_START_AGENT.md` - Quick setup guide
- [ ] Read: `docs/AGENT_SETUP_GUIDE.md` - Detailed setup
- [ ] Read: `docs/ENV_VARIABLES_AGENT.md` - Environment variables
- [ ] Read: `docs/AGENT_INTEGRATION_SPEC.md` - Technical spec

---

## 🚀 Next Steps

- [ ] Integrate IPFS storage into reputation API
- [ ] Add IPFS CID tracking to database
- [ ] Test Frame in Farcaster
- [ ] Set up Chainlink Automation (optional)

---

**Status:** Ready to configure  
**Time Required:** ~5 minutes
