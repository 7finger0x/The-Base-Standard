# GitHub & Vercel Setup - Ready to Deploy
## The Base Standard

**Status:** ✅ All files staged and ready to commit

---

## 📋 What's Being Deployed

### New Features
- ✅ IPFS storage integration (Pinata)
- ✅ Chainlink data feeds
- ✅ Farcaster Frame reputation cards
- ✅ Complete test suite (280 tests passing)
- ✅ Comprehensive documentation

### Files Added/Modified
- 41 files staged for commit
- New agent features in `src/lib/storage/`, `src/lib/chainlink/`, `src/app/frame/`
- Test files for all new features
- Documentation in `docs/`
- Deployment configuration (`vercel.json`)

---

## 🚀 Step 1: Commit to Git

Run these commands:

```bash
# Review what will be committed
git status

# Commit all changes
git commit -m "feat: Add agent features (IPFS, Chainlink, Farcaster) and complete test suite

Features:
- IPFS storage integration with Pinata for decentralized metadata
- Chainlink data feeds for real-time price data and economic scoring
- Farcaster Frame reputation cards with dynamic image generation
- Complete test suite with 280 passing tests (245 TypeScript + 35 Foundry)
- Comprehensive documentation and setup guides

Technical:
- Fix Vite dependency issues (downgrade to v6.1.0)
- Add @testing-library/dom for component tests
- Update environment variable validation
- Add deployment configuration (vercel.json)

Documentation:
- Agent architecture and integration specs
- Setup guides and environment variable docs
- Test execution reports
- Deployment guides"

# Push to GitHub
git push origin submodule-dirty-20e6c
```

**Or merge to main branch first:**

```bash
# Switch to main
git checkout main

# Merge your branch
git merge submodule-dirty-20e6c

# Push to main
git push origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**
   - Sign in with GitHub
   - Click "Import" next to `The-Base-Standard`

2. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto)
   - Install Command: `npm install --legacy-peer-deps` ⚠️ **Important!**

3. **Add Environment Variables**
   
   Go to Settings → Environment Variables and add:

   **Required:**
   ```
   PINATA_JWT_TOKEN=your_pinata_jwt_token_here
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
   ```

   **Database (if using):**
   ```
   DATABASE_URL=your_database_url
   DIRECT_URL=your_direct_url
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts, then deploy to production:
vercel --prod
```

---

## ✅ Step 3: Verify Deployment

### 1. Check Build Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Verify build completed successfully

### 2. Test Endpoints
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Frame page
open https://your-app.vercel.app/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### 3. Verify Agent Features
- Update `NEXT_PUBLIC_BASE_URL` in Vercel to your actual URL
- Test IPFS storage (requires PINATA_JWT_TOKEN)
- Verify Frame images load correctly

---

## 🔧 Important Configuration

### Vercel Settings

The `vercel.json` file is already configured with:
- ✅ Build command: `npm run build`
- ✅ Install command: `npm install --legacy-peer-deps`
- ✅ Framework: Next.js
- ✅ Region: US East (iad1)

### Environment Variables

**Critical:** Set these in Vercel Dashboard:
- `PINATA_JWT_TOKEN` - Required for IPFS storage
- `NEXT_PUBLIC_BASE_URL` - Must match your Vercel URL
- `NEXT_PUBLIC_PINATA_GATEWAY` - IPFS gateway

**After first deployment:**
1. Copy your Vercel URL
2. Update `NEXT_PUBLIC_BASE_URL` in Vercel settings
3. Redeploy

---

## 🔄 Continuous Deployment

Once connected, Vercel will:
- ✅ Auto-deploy on push to `main` → Production
- ✅ Auto-deploy on push to other branches → Preview
- ✅ Auto-deploy on pull requests → Preview

**No manual deployment needed after initial setup!**

---

## 🐛 Troubleshooting

### Build Fails
- **Check:** Install command is `npm install --legacy-peer-deps`
- **Check:** Node.js version is 20+ (set in Vercel settings)

### Environment Variables Not Working
- **Check:** Variables are set in Vercel dashboard
- **Check:** `NEXT_PUBLIC_*` variables are set for client access
- **Fix:** Redeploy after adding variables

### IPFS/Agent Features Not Working
- **Check:** `PINATA_JWT_TOKEN` is set
- **Check:** `NEXT_PUBLIC_BASE_URL` matches Vercel URL
- **Test:** Run `npm run agent:verify` locally with production env vars

---

## 📊 Post-Deployment Checklist

- [ ] Build completed successfully
- [ ] Health endpoint returns 200
- [ ] Frame page loads correctly
- [ ] Environment variables set in Vercel
- [ ] `NEXT_PUBLIC_BASE_URL` updated to actual URL
- [ ] IPFS storage tested (if token is set)
- [ ] Database migrations run (if applicable)

---

## 📚 Documentation

- **Deployment Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Quick Start:** `DEPLOYMENT_QUICKSTART.md`
- **Agent Setup:** `docs/AGENT_SETUP_GUIDE.md`
- **Environment Variables:** `docs/ENV_VARIABLES_AGENT.md`

---

## 🎉 Success!

Once deployed:
- ✅ App live at `https://your-app.vercel.app`
- ✅ Automatic deployments enabled
- ✅ All features working
- ✅ Ready for production use

---

**Ready to deploy!** Follow the steps above to push to GitHub and deploy to Vercel.
