# Deployment Scripts Reference

**Date:** January 15, 2026  
**Quick Reference:** All deployment automation scripts

---

## 📜 Available Scripts

### 1. `scripts/setup-production-db.sh`
**Purpose:** Automated database setup and migration

**Usage:**
```bash
export DATABASE_URL="postgresql://..."
bash scripts/setup-production-db.sh
# Or: npm run db:setup
```

**What it does:**

- ✅ Validates Prisma schema
- ✅ Generates Prisma Client
- ✅ Tests database connection
- ✅ Runs migrations
- ✅ Verifies all tables created
- ✅ Detects Neon vs PostgreSQL

**Requirements:**
- `DATABASE_URL` environment variable
- PostgreSQL database (Neon or standard)

**Time:** ~2-5 minutes

---

### 2. `scripts/deploy-contract.sh`
**Purpose:** Deploy ReputationRegistry to Base mainnet

**Usage:**
```bash
export PRIVATE_KEY="0x..."
export BASE_RPC_URL="https://mainnet.base.org"  # Optional
export BASESCAN_API_KEY="..."  # Optional

cd foundry
../scripts/deploy-contract.sh
# Or: npm run contract:deploy
```

**What it does:**

- ✅ Builds contracts
- ✅ Runs tests
- ✅ Prompts for confirmation
- ✅ Deploys to Base mainnet
- ✅ Verifies contract (if API key provided)

**Requirements:**
- Foundry installed
- Private key with ETH for gas
- Base mainnet RPC access

**Time:** ~5-10 minutes

**⚠️ Security:** Never commit private keys to git!

---

### 3. `scripts/verify-env.sh`
**Purpose:** Validate all production environment variables

**Usage:**
```bash
# Set variables first
export DATABASE_URL="..."
export NEXTAUTH_SECRET="..."
# ... etc

bash scripts/verify-env.sh
# Or: npm run env:verify
```

**What it does:**

- ✅ Checks all required variables are set
- ✅ Validates variable formats
- ✅ Detects testnet addresses
- ✅ Checks for SQLite in production
- ✅ Validates URL formats
- ✅ Checks secret length

**Requirements:**
- Environment variables set

**Time:** <1 minute

---

### 4. `scripts/pre-deploy.sh`
**Purpose:** Pre-deployment validation checks

**Usage:**
```bash
bash scripts/pre-deploy.sh
# Or: npm run pre-deploy
```

**What it does:**

- ✅ Checks Node.js version
- ✅ Installs dependencies
- ✅ TypeScript type check
- ✅ ESLint check
- ✅ Runs tests
- ✅ Builds application
- ✅ Validates Prisma schema
- ✅ Checks for hardcoded secrets

**Requirements:**
- Node.js and npm
- All dependencies installed

**Time:** ~5-10 minutes

---

### 5. `scripts/test-scripts.sh`
**Purpose:** Test all scripts for syntax and dependencies

**Usage:**
```bash
bash scripts/test-scripts.sh
# Or: npm run test:scripts
```

**What it does:**

- ✅ Validates script syntax
- ✅ Checks dependencies
- ✅ Tests Prisma setup
- ✅ Reports missing tools

**Time:** <1 minute

---

## 🔧 Script Features

All scripts include:

### Error Handling

- ✅ `set -e` - Exit on error
- ✅ Validation checks before execution
- ✅ Clear error messages
- ✅ Exit codes for automation

### User Experience

- ✅ Color-coded output (green/yellow/red)
- ✅ Progress indicators
- ✅ Step-by-step feedback
- ✅ Helpful error messages

### Security

- ✅ Input validation
- ✅ Confirmation prompts for destructive actions
- ✅ No hardcoded secrets
- ✅ Warnings for production operations

### Compatibility

- ✅ Works on Linux/Mac
- ✅ Works with Git Bash on Windows
- ✅ Uses standard bash (not zsh-specific)
- ✅ Handles missing dependencies gracefully

---

## 📋 Quick Command Reference

```bash
# Test all scripts
npm run test:scripts

# Verify environment
npm run env:verify

# Setup database
npm run db:setup

# Deploy contract
npm run contract:deploy

# Pre-deployment checks
npm run pre-deploy
```

---

## 🆘 Troubleshooting

### Script won't run
```bash
# Make executable
chmod +x scripts/*.sh

# Or run with bash
bash scripts/script-name.sh
```

### Permission denied

- Check file permissions
- Use `bash` explicitly instead of `./script.sh`

### Script fails silently

- Check exit codes: `echo $?`
- Run with verbose: `bash -x scripts/script-name.sh`

### Windows issues

- Use Git Bash or WSL
- Or use `.bat` versions (if available)

---

## 📚 Related Documentation

- [Quick Deploy Guide](./QUICK_DEPLOY.md) - Fast deployment
- [Local Testing Guide](./LOCAL_TESTING.md) - Test scripts locally
- [Action Plan](../ACTION_PLAN.md) - Detailed day-by-day plan
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Complete checklist

---

**All scripts are production-ready and tested** ✅
