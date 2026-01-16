# Quick Deployment Guide
## GitHub & Vercel Setup

---

## 🚀 Step 1: Push to GitHub

```bash
# Commit all changes
git commit -m "feat: Add agent features and complete test suite

- Implement IPFS storage (Pinata integration)
- Add Chainlink data feeds for economic scoring
- Create Farcaster Frame reputation cards
- Complete test suite (280 tests passing)
- Add comprehensive documentation
- Fix Vite dependency issues
- Add deployment configuration"

# Push to GitHub
git push origin submodule-dirty-20e6c

# Or merge to main first:
git checkout main
git merge submodule-dirty-20e6c
git push origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Via Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `The-Base-Standard` repository
3. Configure:
   - **Framework:** Next.js (auto-detected)
   - **Install Command:** `npm install --legacy-peer-deps`
4. Add Environment Variables:
   ```
   PINATA_JWT_TOKEN=your_token
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
   ```
5. Click **Deploy**

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ✅ Step 3: Verify

1. Visit your Vercel URL
2. Test: `https://your-app.vercel.app/api/health`
3. Test Frame: `https://your-app.vercel.app/frame/reputation?address=0x...`

---

**See `docs/DEPLOYMENT_GUIDE.md` for detailed instructions**
