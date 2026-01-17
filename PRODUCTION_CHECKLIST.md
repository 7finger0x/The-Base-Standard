# Production Deployment Checklist

This checklist ensures The Base Standard is ready for production deployment.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **Database Setup**
  - [ ] PostgreSQL database provisioned
  - [ ] `DATABASE_URL` set to production database
  - [ ] Database migrations run: `npm run db:migrate`
  - [ ] Database seeded if necessary: `npm run db:seed`

- [ ] **Authentication**
  - [ ] `NEXTAUTH_SECRET` generated (min 32 characters): `openssl rand -base64 32`
  - [ ] `NEXTAUTH_URL` set to production domain (e.g., `https://thebasestandard.xyz`)

- [ ] **Blockchain Configuration**
  - [ ] Smart contract deployed to Base mainnet (chain ID: 8453)
  - [ ] `NEXT_PUBLIC_REGISTRY_ADDRESS` updated with mainnet contract
  - [ ] `NEXT_PUBLIC_CHAIN_ID` set to `8453`
  - [ ] `BASE_RPC_URL` set to production RPC endpoint

- [ ] **API Keys** (Optional but Recommended)
  - [ ] `BASESCAN_API_KEY` obtained from basescan.org
  - [ ] `GITCOIN_PASSPORT_API_KEY` obtained from Gitcoin
  - [ ] `INNGEST_SIGNING_KEY` configured for background jobs
  - [ ] `SENTRY_DSN` configured for error tracking (recommended)

- [ ] **External Services**
  - [ ] `PONDER_URL` set to production indexer endpoint
  - [ ] `NEXT_PUBLIC_FARCASTER_HUB_URL` configured
  - [ ] `NEXT_PUBLIC_ETH_PRICE` set or integrated with price oracle

### 2. Smart Contract Deployment

- [ ] **Foundry Setup**
  ```bash
  cd foundry
  forge build
  forge test
  ```

- [ ] **Deploy to Base Mainnet**
  ```bash
  # Set your deployer private key
  export PRIVATE_KEY=your_private_key_here

  # Deploy contract
  forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify
  ```

- [ ] **Verify Contract on BaseScan**
  - [ ] Contract verified and source code public
  - [ ] Contract ownership transferred if needed
  - [ ] Test contract functions on BaseScan UI

- [ ] **Update Environment Variables**
  - [ ] Copy deployed contract address to `NEXT_PUBLIC_REGISTRY_ADDRESS`

### 3. Database Setup

- [ ] **Prisma Migration**
  ```bash
  # Generate Prisma client
  npm run db:generate

  # Run migrations
  npm run db:migrate

  # (Optional) Seed initial data
  npm run db:seed
  ```

- [ ] **Database Backup**
  - [ ] Automated backup strategy configured
  - [ ] Backup restoration tested

### 4. Security Checks

- [ ] **Code Security**
  - [ ] All TODOs resolved
  - [ ] No hardcoded secrets in code
  - [ ] `.env` file not committed to git
  - [ ] Security headers configured (CORS, CSP, etc.)
  - [ ] Rate limiting enabled on API routes

- [ ] **Smart Contract Security**
  - [ ] Contract audited (if budget allows)
  - [ ] Reentrancy guards in place
  - [ ] Access control properly configured
  - [ ] No known vulnerabilities

- [ ] **Dependency Security**
  ```bash
  npm audit
  npm audit fix
  ```

### 5. Performance Optimization

- [ ] **Caching**
  - [ ] Redis or similar cache configured
  - [ ] Static assets CDN configured
  - [ ] Database query caching enabled
  - [ ] API response caching configured

- [ ] **Build Optimization**
  ```bash
  # Test production build
  npm run build

  # Check bundle size
  npm run analyze
  ```

- [ ] **Database Indexing**
  - [ ] Key database fields indexed
  - [ ] Query performance tested

### 6. Monitoring & Logging

- [ ] **Error Tracking**
  - [ ] Sentry or similar error tracking configured
  - [ ] Error alerts set up
  - [ ] Error handler tested

- [ ] **Application Monitoring**
  - [ ] Vercel Analytics enabled (if using Vercel)
  - [ ] Custom analytics configured
  - [ ] Performance monitoring enabled

- [ ] **Logging**
  - [ ] Production logging configured
  - [ ] Log aggregation service set up (optional)
  - [ ] Log retention policy defined

### 7. Testing

- [ ] **Unit Tests**
  ```bash
  npm test
  ```

- [ ] **Integration Tests**
  ```bash
  npm run test:integration
  ```

- [ ] **E2E Tests**
  ```bash
  npm run test:e2e
  ```

- [ ] **Manual Testing**
  - [ ] Wallet connection flow
  - [ ] Score calculation
  - [ ] Tier display
  - [ ] NFT minting
  - [ ] Leaderboard
  - [ ] Multi-wallet linking

### 8. Domain & DNS

- [ ] **Domain Setup**
  - [ ] Domain purchased and configured
  - [ ] DNS records pointing to deployment platform
  - [ ] SSL certificate configured (auto with Vercel)

- [ ] **Subdomain Configuration**
  - [ ] API subdomain (if separate): `api.thebasestandard.xyz`
  - [ ] Indexer subdomain: `indexer.thebasestandard.xyz`

### 9. Deployment Platform (Vercel)

- [ ] **Vercel Project Setup**
  - [ ] Project imported from GitHub
  - [ ] Environment variables configured in Vercel dashboard
  - [ ] Build settings verified
  - [ ] Deploy hooks configured

- [ ] **Preview Deployments**
  - [ ] Preview deployment tested
  - [ ] All features working in preview

- [ ] **Production Deployment**
  ```bash
  # Deploy via Vercel CLI
  vercel --prod

  # Or push to main branch (if auto-deploy enabled)
  git push origin main
  ```

### 10. Post-Deployment

- [ ] **Smoke Tests**
  - [ ] Homepage loads
  - [ ] Wallet connection works
  - [ ] API endpoints responding
  - [ ] Database queries working

- [ ] **Monitor First 24 Hours**
  - [ ] Check error rates
  - [ ] Monitor API response times
  - [ ] Review user feedback
  - [ ] Check blockchain transactions

- [ ] **Documentation**
  - [ ] README updated with production info
  - [ ] API documentation published
  - [ ] User guide available
  - [ ] Deployment runbook created

### 11. Indexer Deployment (Ponder)

- [ ] **Ponder Setup**
  ```bash
  cd apps/indexer
  ponder build
  ```

- [ ] **Deploy Ponder**
  - [ ] Railway/Render/fly.io project created
  - [ ] PostgreSQL database connected
  - [ ] Environment variables configured
  - [ ] Ponder service running

- [ ] **Verify Indexer**
  - [ ] Check indexer logs
  - [ ] Verify events being indexed
  - [ ] Test API endpoints

### 12. Agent Deployment (Python)

- [ ] **Agent Setup**
  ```bash
  cd apps/agent
  pip install -r requirements.txt
  ```

- [ ] **Deploy Agent**
  - [ ] Server/container provisioned
  - [ ] CDP wallet credentials configured
  - [ ] Environment variables set
  - [ ] Agent running as background service

- [ ] **Monitor Agent**
  - [ ] Check agent logs
  - [ ] Verify score updates
  - [ ] Monitor gas usage

## 🚀 Deployment Commands

### Quick Deploy (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Database Migration
```bash
# Production migration
DATABASE_URL="your_production_db_url" npm run db:migrate
```

### Build Check
```bash
# Ensure clean build
npm run build

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## 🔧 Environment Variables Reference

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=<32+ character secret>
NEXTAUTH_URL=https://thebasestandard.xyz
BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453
```

### Optional
```env
BASESCAN_API_KEY=...
GITCOIN_PASSPORT_API_KEY=...
INNGEST_SIGNING_KEY=...
SENTRY_DSN=...
PONDER_URL=https://indexer.thebasestandard.xyz
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
NEXT_PUBLIC_ETH_PRICE=2500
```

## 📊 Success Metrics

After deployment, monitor:
- [ ] API response time < 500ms (p95)
- [ ] Error rate < 0.1%
- [ ] Score calculation time < 2s
- [ ] Database query time < 100ms
- [ ] Uptime > 99.9%

## 🆘 Rollback Plan

If issues occur:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous git commit
git revert HEAD
git push origin main
```

## 📞 Support & Monitoring

- **Error Dashboard**: [Sentry Dashboard URL]
- **Analytics**: [Vercel Analytics URL]
- **Status Page**: [Optional status page]
- **Alerting**: Configure alerts for critical errors

---

**Last Updated**: 2026-01-17
**Next Review**: Before production deployment
