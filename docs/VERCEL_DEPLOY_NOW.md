# Deploy to Vercel - Quick Guide
## The Base Standard

**Status:** ✅ Code pushed to GitHub successfully  
**Branch:** `submodule-dirty-20e6c`  
**Next:** Deploy to Vercel

---

## 🚀 Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Go to Vercel
Visit: https://vercel.com/new

### Step 2: Import Repository
1. Sign in with GitHub
2. Click **"Import"** next to `The-Base-Standard`
3. Or click **"Add New Project"** → **"Import Git Repository"** → Select `The-Base-Standard`

### Step 3: Configure Project

**Branch to Deploy:**
- Select: `submodule-dirty-20e6c` (or merge to `main` first)

**Framework Preset:**
- Next.js (auto-detected ✅)

**Root Directory:**
- `./` (root)

**Build Settings:**
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install --legacy-peer-deps` ⚠️ **IMPORTANT!**
- **Node.js Version:** 20.x (recommended)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

**Required:**
```
PINATA_JWT_TOKEN=your_pinata_jwt_token_here
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

**Database (if using Supabase/Neon):**
```
DATABASE_URL=your_database_url_with_pooling
DIRECT_URL=your_direct_database_url
```

**Optional (for Chainlink):**
```
CHAINLINK_FUNCTIONS_ROUTER=0x...
CHAINLINK_AUTOMATION_REGISTRY=0x...
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at `https://your-app-name.vercel.app`

### Step 6: Update Base URL (After First Deploy)
1. Copy your actual Vercel URL
2. Go to Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_BASE_URL` to your actual URL
4. Redeploy (or it will auto-redeploy on next push)

---

## ⚡ Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
cd c:\bmr\tbs
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time)
# - Project name? the-base-standard
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod

# To set environment variables via CLI
vercel env add PINATA_JWT_TOKEN
vercel env add NEXT_PUBLIC_BASE_URL
vercel env add NEXT_PUBLIC_PINATA_GATEWAY
```

---

## ✅ Post-Deployment Verification

### 1. Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Test Frame Page
Visit: `https://your-app.vercel.app/frame/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

### 3. Test API Endpoints
- Health: `/api/health`
- Reputation: `/api/reputation?address=0x...`
- Leaderboard: `/api/leaderboard`

### 4. Verify Agent Features (if tokens set)
- IPFS storage should work
- Frame images should generate
- Chainlink integration ready

---

## 🔄 Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy on push to `main` → Production
- ✅ Deploy on push to other branches → Preview
- ✅ Deploy on pull requests → Preview

**No manual deployment needed!**

---

## 📊 Current Status

- ✅ Code pushed to GitHub
- ✅ Branch: `submodule-dirty-20e6c`
- ✅ Ready for Vercel deployment
- ⏳ Waiting for Vercel setup

---

## 🔗 Quick Links

- **GitHub Repo:** https://github.com/7finger0x/The-Base-Standard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Create Project:** https://vercel.com/new
- **Pull Request:** https://github.com/7finger0x/The-Base-Standard/pull/new/submodule-dirty-20e6c

---

## 🐛 Troubleshooting

### Build Fails
- Check: Install command is `npm install --legacy-peer-deps`
- Check: Node.js version is 20.x in Vercel settings

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check `NEXT_PUBLIC_*` variables are set for client access

### IPFS/Agent Features Not Working
- Verify `PINATA_JWT_TOKEN` is set in Vercel
- Check `NEXT_PUBLIC_BASE_URL` matches your Vercel URL
- Test locally first: `npm run agent:verify`

---

**Ready to deploy!** Follow Option 1 (Dashboard) for the easiest setup.
