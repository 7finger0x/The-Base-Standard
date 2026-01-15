# Local Script Testing Guide

**Date:** January 15, 2026  
**Purpose:** Test deployment scripts locally before production

---

## 🧪 Testing Overview

Before deploying to production, test all scripts locally to ensure they work correctly.

---

## Prerequisites

### Required
- [x] Node.js and npm installed
- [x] Prisma CLI available (via `npx prisma`)
- [x] Bash shell (Git Bash on Windows, or WSL)

### Optional
- [ ] Local PostgreSQL database (for database script testing)
- [ ] Foundry installed (for contract deployment testing)
- [ ] Vercel CLI installed

---

## Step 1: Test Script Syntax

### Run Test Suite
```bash
# Test all scripts for syntax errors
bash scripts/test-scripts.sh

# Or on Windows (Git Bash)
bash scripts/test-scripts.sh
```

**Expected Output:**

```text
✅ All scripts have valid syntax
✅ All dependencies available
✅ Prisma schema valid
```

**If errors occur:**

- Check that you're in the project root directory
- Ensure bash is available (Git Bash on Windows)
- Verify npm and npx are in PATH

---

## Step 2: Test Environment Verification Script

### Test Without Variables (Should Fail)
```bash
# Clear environment
unset DATABASE_URL
unset NEXTAUTH_SECRET
unset NEXTAUTH_URL

# Run verification
bash scripts/verify-env.sh
```

**Expected:** Script should report missing variables

### Test With Mock Variables (Should Pass Validation)
```bash
# Set test variables
export DATABASE_URL="postgresql://test:test@localhost:5432/test"
export NEXTAUTH_SECRET="test-secret-32-characters-long-here"
export NEXTAUTH_URL="http://localhost:3000"
export NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"
export NEXT_PUBLIC_REGISTRY_ADDRESS="0x1234567890123456789012345678901234567890"
export NEXT_PUBLIC_CHAIN_ID="8453"
export NEXT_PUBLIC_ONCHAINKIT_API_KEY="test-key"

# Run verification
bash scripts/verify-env.sh
```

**Expected:**

- ✅ All required variables set
- ⚠️  May warn about testnet/localhost (expected for testing)

### Test With Invalid Variables (Should Fail)
```bash
# Set invalid variables
export DATABASE_URL="file:./test.db"  # SQLite (invalid for production)
export NEXT_PUBLIC_REGISTRY_ADDRESS="0xA69FFF6D7B3D47E4945F0bF60Aac73f49DBd59a9"  # Testnet address
export NEXTAUTH_SECRET="short"  # Too short

# Run verification
bash scripts/verify-env.sh
```

**Expected:** Script should detect and report invalid values

---

## Step 3: Test Database Setup Script (Optional)

**⚠️ Requires:** Local PostgreSQL database or test Neon database

### Option A: Local PostgreSQL
```bash
# Set up local PostgreSQL connection
export DATABASE_URL="postgresql://postgres:password@localhost:5432/test_db"

# Run database setup
bash scripts/setup-production-db.sh
```

### Option B: Test Neon Database
```bash
# Get test database from Neon (free tier)
# Create project at https://neon.tech
# Copy connection string

export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db"

# Run database setup
bash scripts/setup-production-db.sh
```

**Expected Output:**
```
✅ Prisma schema is valid
✅ Prisma Client generated
✅ Database connection successful
✅ Migrations deployed successfully
✅ All required tables exist
✅ Database setup complete!
```

**What to Check:**
- [ ] All steps complete without errors
- [ ] Tables created in database
- [ ] Can query database successfully

---

## Step 4: Test Contract Deployment Script (Optional)

**⚠️ Requires:** Foundry installed and Base testnet/mainnet access

### Test Script Syntax Only
```bash
# Just verify script syntax (won't deploy)
bash -n scripts/deploy-contract.sh
```

**Expected:** No output (syntax valid)

### Test With Dry Run (No Deployment)
```bash
cd foundry

# Test build and tests only
forge build
forge test

# Script will prompt before actual deployment
```

**Note:** Actual deployment requires:

- Private key with ETH
- Base mainnet RPC access
- Gas fees

**Recommended:** Test on Base Sepolia testnet first

---

## Step 5: Test Pre-Deployment Script

### Run Full Pre-Deployment Checks
```bash
bash scripts/pre-deploy.sh
```

**Expected Output:**

```text
✅ TypeScript check passed
✅ Lint check passed
✅ Tests passed
✅ Build successful
✅ Prisma schema valid
✅ All pre-deployment checks passed!
```

**What to Check:**
- [ ] All checks pass
- [ ] No errors or warnings
- [ ] Build completes successfully

---

## Step 6: Integration Test

### Test Complete Workflow (Without Actual Deployment)

```bash
# 1. Verify environment
bash scripts/verify-env.sh

# 2. Run pre-deployment checks
bash scripts/pre-deploy.sh

# 3. Test build
npm run build

# 4. Test local server
npm start
# Visit http://localhost:3000
# Test /api/health endpoint
```

---

## Common Issues & Solutions

### Issue: "bash: command not found"

**Solution:**

- Windows: Use Git Bash or WSL
- Mac/Linux: Should work natively

### Issue: "Prisma not found"

**Solution:**

- Scripts use `npx prisma` which should work
- Run `npm install` to ensure dependencies

### Issue: "Permission denied"

**Solution:**

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Or run with bash explicitly
bash scripts/script-name.sh
```

### Issue: "DATABASE_URL not set"

**Solution:**

- This is expected for testing
- Scripts will show helpful error messages
- Set test variables as shown above

---

## Test Checklist

- [ ] All scripts have valid syntax
- [ ] Environment verification script works
- [ ] Database setup script works (if testing with DB)
- [ ] Pre-deployment script passes all checks
- [ ] Build completes successfully
- [ ] Local server starts without errors

---

## Next Steps After Testing

Once all scripts test successfully:

1. **Set up production database** (Neon or Vercel Postgres)

2. **Deploy smart contract** to Base mainnet

3. **Configure production environment variables**

4. **Deploy to Vercel**

See [Quick Deploy Guide](./QUICK_DEPLOY.md) for production deployment.

---

## Safety Notes

- ✅ Scripts include safety checks and confirmations
- ✅ No scripts will modify production without explicit confirmation
- ✅ All scripts validate inputs before execution
- ✅ Database scripts won't drop data without warning
- ✅ Contract deployment requires manual confirmation

---

**Testing Complete?** Proceed to [Quick Deploy Guide](./QUICK_DEPLOY.md) 🚀
