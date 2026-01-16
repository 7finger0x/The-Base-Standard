# Deployment Guide
## The Base Standard - GitHub & Vercel

**Status:** ✅ Ready for Deployment

---

## 🚀 Quick Deployment Steps

### 1. Commit and Push to GitHub

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add agent features (IPFS, Chainlink, Farcaster Frames) and complete test suite

- Implement IPFS storage integration with Pinata
- Add Chainlink data feeds for economic scoring
- Create Farcaster Frame reputation cards
- Complete test suite (280 tests passing)
- Add comprehensive documentation
- Fix Vite dependency issues"

# Push to GitHub
git push origin submodule-dirty-20e6c

# Or if you want to push to main:
git checkout main
git merge submodule-dirty-20e6c
git push origin main
```

---

## 📦 Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub
   - Click "Add New Project"

2. **Import Repository**
   - Select `The-Base-Standard` from your GitHub repos
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install --legacy-peer-deps`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   **Required:**
   ```
   PINATA_JWT_TOKEN=your_pinata_token_here
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
   ```

   **Database (if using Supabase/Neon):**
   ```
   DATABASE_URL=your_database_url
   DIRECT_URL=your_direct_url
   ```

   **Optional (for Chainlink):**
   ```
   CHAINLINK_FUNCTIONS_ROUTER=0x...
   CHAINLINK_AUTOMATION_REGISTRY=0x...
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time) or Yes (if updating)
# - Project name? the-base-standard
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

---

## 🔧 Vercel Configuration

The project includes `vercel.json` with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Key Settings:**
- Uses `--legacy-peer-deps` for dependency resolution
- Auto-detects Next.js framework
- Deploys to US East (iad1) region

---

## 🌍 Environment Variables Setup

### Required Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PINATA_JWT_TOKEN` | Pinata API JWT token | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel app URL | `https://the-base-standard.vercel.app` |
| `NEXT_PUBLIC_PINATA_GATEWAY` | IPFS gateway | `gateway.pinata.cloud` |

### Database Variables (if using Supabase/Neon)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string with pooling |
| `DIRECT_URL` | Direct connection string |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `CHAINLINK_FUNCTIONS_ROUTER` | Chainlink Functions router address |
| `CHAINLINK_AUTOMATION_REGISTRY` | Chainlink Automation registry |

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Visit your Vercel URL
- [ ] Check health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Verify build logs show no errors

### 2. Test Agent Features
- [ ] Run: `npm run agent:verify` (locally with production env vars)
- [ ] Test IPFS storage: `npm run agent:test-ipfs`
- [ ] Visit Frame page: `https://your-app.vercel.app/frame/reputation?address=0x...`

### 3. Configure Services
- [ ] Update `NEXT_PUBLIC_BASE_URL` in Vercel to your actual URL
- [ ] Verify Pinata token is set correctly
- [ ] Test IPFS storage works

### 4. Database Setup (if applicable)
- [ ] Run migrations: `npm run db:migrate:deploy`
- [ ] Verify database connection
- [ ] Test API endpoints that use database

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployment
- ✅ Pull requests → Preview deployment

**No action needed** - deployments happen automatically!

---

## 🐛 Troubleshooting

### Build Fails with Dependency Errors
**Solution:** Vercel should use `--legacy-peer-deps` from `vercel.json`. If not:
1. Check `vercel.json` is committed
2. Manually set Install Command in Vercel dashboard

### Environment Variables Not Working
**Solution:**
1. Check variables are set in Vercel dashboard
2. Ensure `NEXT_PUBLIC_*` variables are set for client-side access
3. Redeploy after adding variables

### IPFS/Agent Features Not Working
**Solution:**
1. Verify `PINATA_JWT_TOKEN` is set in Vercel
2. Check `NEXT_PUBLIC_BASE_URL` matches your Vercel URL
3. Run `npm run agent:verify` to check configuration

### Database Connection Issues
**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check connection pooling is enabled
3. Ensure database allows Vercel IPs (if using IP allowlist)

---

## 📊 Monitoring

### Vercel Analytics
- View deployment logs in Vercel dashboard
- Check function execution times
- Monitor error rates

### Health Checks
- Set up monitoring for `/api/health` endpoint
- Use Vercel's built-in monitoring or external service

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore` ✅
- [ ] No API keys committed to git ✅
- [ ] Database credentials are secure
- [ ] Rate limiting is enabled
- [ ] CORS is configured correctly

---

## 📝 Deployment Commands Reference

```bash
# Local development
npm run dev

# Build locally
npm run build

# Run tests before deploying
npm run test:run

# Type check
npm run typecheck

# Lint
npm run lint

# Deploy to Vercel (CLI)
vercel --prod

# View Vercel deployments
vercel ls
```

---

## 🎉 Success!

Once deployed:
- ✅ Your app is live at `https://your-app.vercel.app`
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Environment variables configured
- ✅ All features working

---

**Last Updated:** January 2026  
**Status:** ✅ Ready for Deployment
