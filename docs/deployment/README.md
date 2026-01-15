# Deployment Documentation

**The Base Standard** - Production Deployment Guides

---

## 🚀 Quick Start

**New to deployment?** Start here:

1. **[Quick Deploy Guide](./QUICK_DEPLOY.md)** - Fast-track deployment (2-3 hours)
2. **[Local Testing Guide](./LOCAL_TESTING.md)** - Test scripts before production
3. **[Script Reference](./SCRIPT_REFERENCE.md)** - All automation scripts

---

## 📚 Complete Documentation

### Getting Started

- **[Quick Deploy Guide](./QUICK_DEPLOY.md)** ⚡ - Fast deployment guide
- **[Local Testing Guide](./LOCAL_TESTING.md)** 🧪 - Test scripts locally
- **[Script Reference](./SCRIPT_REFERENCE.md)** 📜 - Script documentation

### Detailed Guides

- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** ✅ - Complete checklist
- **[Production Project Paper](./PRODUCTION_PROJECT_PAPER.md)** 📄 - Technical spec
- **[Action Plan](../ACTION_PLAN.md)** 📋 - Day-by-day execution plan

### Reference

- **[Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)** 📖 - Detailed procedures
- **[Environment Variables](../ENV_VARIABLES.md)** 🔐 - Configuration guide

---

## 🎯 Deployment Workflow

```text
1. Test Scripts Locally
   └─> scripts/test-scripts.sh
   
2. Set Up Database
   └─> scripts/setup-production-db.sh
   
3. Deploy Contract
   └─> scripts/deploy-contract.sh
   
4. Configure Environment
   └─> scripts/verify-env.sh
   
5. Deploy to Vercel
   └─> vercel --prod
```

---

## ⚡ Quick Commands

```bash
# Test all scripts
npm run test:scripts

# Setup database
npm run db:setup

# Verify environment
npm run env:verify

# Pre-deployment checks
npm run pre-deploy

# Deploy contract
npm run contract:deploy
```

---

## 📋 Deployment Checklist

### Before Starting
- [ ] Read [Quick Deploy Guide](./QUICK_DEPLOY.md)
- [ ] Test scripts locally ([Local Testing Guide](./LOCAL_TESTING.md))
- [ ] Have all prerequisites ready

### Prerequisites
- [ ] Neon account OR Vercel Postgres
- [ ] Base mainnet wallet with ETH
- [ ] Coinbase Developer Portal account
- [ ] Vercel account

### Deployment Steps
- [ ] Database set up
- [ ] Smart contract deployed
- [ ] Environment variables configured
- [ ] Vercel deployment successful
- [ ] All endpoints verified

---

## 🆘 Need Help?

### Common Issues

- **Script errors:** See [Script Reference](./SCRIPT_REFERENCE.md)
- **Database issues:** See [Quick Deploy Guide](./QUICK_DEPLOY.md) troubleshooting
- **Deployment issues:** See [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)

### Testing

- Test scripts locally first: `npm run test:scripts`
- Verify environment: `npm run env:verify`
- Run pre-deployment checks: `npm run pre-deploy`

---

## 📊 Status

**Current Status:** ✅ Ready for Production Deployment

**Scripts Status:**

- ✅ Database setup script - Ready
- ✅ Contract deployment script - Ready
- ✅ Environment verification - Ready
- ✅ Pre-deployment checks - Ready

**Documentation Status:**

- ✅ Quick Deploy Guide - Complete
- ✅ Local Testing Guide - Complete
- ✅ Script Reference - Complete
- ✅ Action Plan - Complete

---

**Ready to deploy?** Start with [Quick Deploy Guide](./QUICK_DEPLOY.md) 🚀
