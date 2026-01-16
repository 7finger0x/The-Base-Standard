# Final Setup Instructions
## The Base Standard - Agent Features

**Status:** ✅ All code implemented and ready  
**Action Required:** Set environment variables

---

## 🎯 Quick Setup (5 minutes)

### Step 1: Get Pinata JWT Token

1. Visit [pinata.cloud](https://pinata.cloud)
2. Sign up or log in (free account works)
3. Go to **API Keys** → **New Key**
4. Select **Admin** permissions
5. **Copy the JWT Token**

### Step 2: Create/Update `.env.local`

Create or update `.env.local` in the project root:

```bash
# IPFS Storage (Required)
PINATA_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Paste your token here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# Farcaster Frames (Required)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Chainlink (Optional - for future automation)
# CHAINLINK_FUNCTIONS_ROUTER=0x...
# CHAINLINK_AUTOMATION_REGISTRY=0x...
```

**⚠️ Important:** Never commit `.env.local` to git!

### Step 3: Verify Setup

```bash
# Quick verification
npx tsx scripts/verify-agent-setup.ts

# Detailed service check
npx tsx scripts/check-services.ts
```

Expected output:
```
✅ PINATA_JWT_TOKEN: ✅ Set
✅ NEXT_PUBLIC_BASE_URL: ✅ Set
✅ IPFS (Pinata): Configured
```

### Step 4: Test IPFS Storage

```bash
npx tsx scripts/test-ipfs.ts
```

This will:
- Store test reputation data on IPFS
- Return a CID (Content Identifier)
- Show you the gateway URL to view it

Expected output:
```
✅ Successfully stored on IPFS!
   CID: bafy...
   Gateway URL: https://gateway.pinata.cloud/ipfs/bafy...
```

### Step 5: Test Farcaster Frame

```bash
# Start dev server
npm run dev
```

Then visit:
- **Frame Page:** `http://localhost:3000/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- **Image API:** `http://localhost:3000/api/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

---

## ✅ Verification Checklist

- [ ] Pinata JWT token obtained
- [ ] `.env.local` created with `PINATA_JWT_TOKEN`
- [ ] `.env.local` includes `NEXT_PUBLIC_BASE_URL`
- [ ] `npx tsx scripts/verify-agent-setup.ts` shows all ✅
- [ ] `npx tsx scripts/test-ipfs.ts` successfully stores data
- [ ] Frame page loads at `/frame/reputation?address=0x...`
- [ ] Frame image API returns SVG at `/api/frame/reputation?address=0x...`

---

## 🚀 What's Ready

### ✅ IPFS Storage
- Store reputation metadata: `POST /api/storage/ipfs/reputation`
- Library function: `storeReputationMetadata()`
- File storage: `storeFileOnIPFS()`
- Gateway resolution: `resolveIPFSUrl()`

### ✅ Farcaster Frames
- Frame page: `/frame/reputation?address=0x...`
- Image generation: `/api/frame/reputation?address=0x...`
- Dynamic reputation cards
- Ready for Farcaster sharing

### ✅ Chainlink Integration
- Data feeds: `getBasePrice()`, `getETHPrice()`
- Economic scoring: `calculateEconomicActivityScore()`
- Ready for automation (needs contract deployment)

---

## 📚 Documentation

- **Quick Start:** `docs/QUICK_START_AGENT.md`
- **Setup Guide:** `docs/AGENT_SETUP_GUIDE.md`
- **Environment Variables:** `docs/ENV_VARIABLES_AGENT.md`
- **Technical Spec:** `docs/AGENT_INTEGRATION_SPEC.md`
- **Architecture:** `docs/WEB3_AGENT_ARCHITECTURE.md`
- **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY.md`

---

## 🐛 Troubleshooting

### "IPFS service not configured"
- **Solution:** Check `PINATA_JWT_TOKEN` is in `.env.local`
- **Verify:** Run `npx tsx scripts/check-services.ts`

### "Cannot find module 'tsx'"
- **Solution:** Use `npx tsx` (no installation needed) or install: `npm install -g tsx`

### Frame images not loading
- **Check:** `NEXT_PUBLIC_BASE_URL` is set correctly
- **Check:** Dev server is running (`npm run dev`)
- **Test:** Visit the image API URL directly in browser

### Test script fails with "server-only" error
- **Solution:** The test script has been updated to bypass server-only restrictions
- **Note:** This is expected - the script uses direct API calls for testing

---

## 🎉 Success!

Once you see:
- ✅ All services configured
- ✅ IPFS test stores data successfully
- ✅ Frame page and image API work

**You're ready to use all agent features!**

---

## 📞 Next Steps

1. **Integrate IPFS into reputation API** - Store snapshots when scores update
2. **Share Frame in Farcaster** - Test in a real Farcaster post
3. **Set up Chainlink Automation** - For autonomous updates (optional)

See `docs/AGENT_INTEGRATION_SPEC.md` for detailed integration guide.

---

**Last Updated:** January 2026  
**Status:** ✅ Ready for Configuration
