# Quick Start: Agent Features Setup
## The Base Standard

**Time Required:** 5 minutes  
**Difficulty:** Easy

---

## Step 1: Get Pinata JWT Token (2 minutes)

1. Go to [pinata.cloud](https://pinata.cloud) and sign up (free)
2. Navigate to **API Keys** → **New Key**
3. Select **Admin** permissions
4. Copy the **JWT Token**

---

## Step 2: Add to .env.local (1 minute)

Open or create `.env.local` in the project root and add:

```bash
# IPFS Storage
PINATA_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your token here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# Farcaster Frames
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to git!

---

## Step 3: Verify Setup (1 minute)

Run the service check:

```bash
npx tsx scripts/check-services.ts
```

You should see:
```
✅ IPFS (Pinata): Configured
```

---

## Step 4: Test IPFS Storage (1 minute)

```bash
npx tsx scripts/test-ipfs.ts
```

Expected output:
```
✅ Successfully stored on IPFS!
   CID: bafy...
   Gateway URL: https://gateway.pinata.cloud/ipfs/bafy...
```

---

## Step 5: Test Farcaster Frame

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit Frame page:
   ```
   http://localhost:3000/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   ```

3. Test image generation:
   ```
   http://localhost:3000/api/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   ```

---

## ✅ You're Ready!

Your agent features are now configured. You can:

- **Store reputation data on IPFS** using the API or library functions
- **Generate Farcaster Frames** for social sharing
- **Use Chainlink data feeds** for economic activity scoring

---

## Next Steps

1. **Integrate IPFS into reputation API** - Store snapshots when scores update
2. **Share Frame in Farcaster** - Test the Frame in a real Farcaster post
3. **Set up Chainlink Automation** - For autonomous score updates (optional)

See `docs/AGENT_INTEGRATION_SPEC.md` for detailed integration guide.

---

## Troubleshooting

### "IPFS service not configured"
- Check `PINATA_JWT_TOKEN` is set in `.env.local`
- Restart dev server after adding env vars

### "Cannot find module 'tsx'"
- Install: `npm install -g tsx` or use `npx tsx`

### Frame images not loading
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Ensure dev server is running

---

**Last Updated:** January 2026
