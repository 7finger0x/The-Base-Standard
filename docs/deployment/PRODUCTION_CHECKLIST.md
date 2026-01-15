# Production Deployment Checklist

This checklist ensures your The Base Standard deployment is production-ready and secure.

## 🔐 Security Configuration

### ✅ Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Set `DATABASE_URL` to production database (NOT `file:./dev.db`)
- [ ] Set `NODE_ENV=production`
- [ ] Generate and set `NEXT_PUBLIC_ONCHAINKIT_API_KEY` from [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
- [ ] Verify no secrets are committed to git
- [ ] Review all environment variables in `.env` file

### ✅ Smart Contract Deployment
- [ ] Deploy `ReputationRegistry.sol` to Base mainnet using Foundry
- [ ] Run: `cd foundry && forge script script/Deploy.s.sol --broadcast --verify --rpc-url $BASE_RPC_URL`
- [ ] Update `NEXT_PUBLIC_REGISTRY_ADDRESS` in `.env` with mainnet contract address
- [ ] **CRITICAL**: Remove testnet address `0xA69FFF6D7B3D47E4945F0bF60Aac73f49DBd59a9`
- [ ] Verify contract on Basescan
- [ ] Test contract functions (linkWallet, updateScore)

### ✅ Database Setup
- [ ] Choose production database:
  - [ ] Option 1: PostgreSQL (recommended for production)
  - [ ] Option 2: MySQL
  - [ ] Option 3: SQLite (only for small deployments)
- [ ] Update Prisma schema if using PostgreSQL/MySQL (change `provider` in `prisma/schema.prisma`)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify database connection: `npx prisma db push`
- [ ] Set up database backups
- [ ] Configure connection pooling (if using PostgreSQL/MySQL)

### ✅ Security Headers (Already Configured)
- [x] X-Frame-Options: SAMEORIGIN
- [x] X-Content-Type-Options: nosniff
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Rate limiting middleware (100 req/min per IP)

## 🚀 Build & Deployment

### ✅ Pre-deployment Tests
- [ ] Run TypeScript type check: `npm run typecheck`
- [ ] Run linting: `npm run lint`
- [ ] Run frontend tests: `npm run test:frontend`
- [ ] Run Foundry contract tests: `npm run foundry:test`
- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm start`

### ✅ Vercel Deployment (Recommended)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Link project: `vercel link`
- [ ] Set environment variables in Vercel dashboard:
  - [ ] DATABASE_URL
  - [ ] NEXT_PUBLIC_REGISTRY_ADDRESS (mainnet)
  - [ ] NEXT_PUBLIC_ONCHAINKIT_API_KEY
  - [ ] All other required variables from `.env.example`
- [ ] Deploy: `vercel --prod`
- [ ] Verify deployment health: `curl https://your-domain.vercel.app/api/health`

### ✅ Alternative Deployment (Docker/Custom)
- [ ] Create `Dockerfile` for Next.js app
- [ ] Build Docker image
- [ ] Set up container orchestration (Kubernetes/ECS)
- [ ] Configure load balancer
- [ ] Set up SSL/TLS certificates
- [ ] Configure DNS records

## 📊 Monitoring & Logging

### ✅ Application Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Create alerts for:
  - [ ] API errors (5xx responses)
  - [ ] Database connection failures
  - [ ] High response times (>2s)
  - [ ] Rate limit violations

### ✅ Health Checks
- [ ] Test health endpoint: `GET /api/health`
- [ ] Verify all services report healthy:
  - [ ] Database connection
  - [ ] RPC endpoints (Base, Zora)
  - [ ] Ponder indexer (if configured)

## 🔄 Optional Services

### ✅ Ponder Indexer (Optional but Recommended)
- [ ] Deploy Ponder service separately
- [ ] Configure `PONDER_URL` in environment
- [ ] Set `PONDER_DATABASE_URL` (separate from main DB)
- [ ] Set `PONDER_RPC_URL_BASE` and `PONDER_RPC_URL_ZORA`
- [ ] Verify indexer is syncing: `curl $PONDER_URL/health`
- [ ] Test API endpoints: `curl $PONDER_URL/api/leaderboard`

### ✅ CDP AgentKit (Optional - Autonomous Updates)
- [ ] Create CDP API credentials at [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
- [ ] Set `CDP_KEY_NAME` and `CDP_PRIVATE_KEY`
- [ ] Deploy Python agent: `cd apps/agent && python main.py`
- [ ] Configure agent schedule (default: every 60 minutes)
- [ ] Fund agent wallet with Base ETH for gas fees
- [ ] Monitor agent logs for errors

### ✅ Farcaster Frames (Optional)
- [ ] Set `NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz`
- [ ] Test frame rendering
- [ ] Validate frame metadata

## 🛡️ Security Hardening

### ✅ API Security
- [x] Rate limiting configured (100 req/min)
- [ ] Consider implementing API key authentication for admin endpoints
- [ ] Set up CORS if needed for external integrations
- [ ] Review and test all input validation
- [ ] Implement request logging for audit trail

### ✅ Smart Contract Security
- [ ] Audit smart contract code
- [ ] Test with small amounts first
- [ ] Verify contract ownership is set correctly
- [ ] Document contract upgrade procedures (if applicable)
- [ ] Set up multi-sig for owner actions (recommended)

### ✅ Infrastructure Security
- [ ] Enable DDoS protection
- [ ] Configure Web Application Firewall (WAF)
- [ ] Set up SSL/TLS (handled by Vercel if using)
- [ ] Regular security updates for dependencies
- [ ] Implement secrets rotation policy

## 📈 Performance Optimization

### ✅ Caching Strategy
- [x] API routes have cache headers
- [ ] Configure CDN (Vercel Edge Network or CloudFlare)
- [ ] Review and optimize database queries
- [ ] Consider Redis for caching (if needed)

### ✅ Database Optimization
- [ ] Add database indexes (already configured in schema)
- [ ] Monitor query performance
- [ ] Set up connection pooling
- [ ] Configure read replicas (for high traffic)

## 🧪 Post-Deployment Validation

### ✅ Functional Testing
- [ ] Test wallet connection (Coinbase Wallet)
- [ ] Test reputation score display
- [ ] Test leaderboard pagination
- [ ] Test wallet linking functionality
- [ ] Verify ENS name resolution works
- [ ] Test all API endpoints

### ✅ Integration Testing
- [ ] Verify smart contract interactions work
- [ ] Test Ponder indexer integration (if using)
- [ ] Verify OnchainKit features work
- [ ] Test error handling and fallbacks

## 📝 Documentation

### ✅ User Documentation
- [ ] Update README.md with production URLs
- [ ] Document API endpoints
- [ ] Create user guide for wallet linking
- [ ] Document tier system and scoring

### ✅ Internal Documentation
- [ ] Document deployment procedures
- [ ] Create runbook for common issues
- [ ] Document rollback procedures
- [ ] Create incident response plan

## ⚠️ Known Issues & Limitations

### Current Limitations:
1. **In-memory rate limiting**: Rate limits reset on server restart. For production at scale, implement Redis-based rate limiting.
2. **SQLite database**: Not recommended for high-traffic production. Migrate to PostgreSQL for better performance and reliability.
3. **Base Names resolution**: Currently using mock implementation. Integrate with actual Base Names API for production.
4. **No authentication on admin endpoints**: `updateScore` is owner-only on contract, but consider adding API-level auth.

## 🆘 Support & Troubleshooting

### Common Issues:

**Build fails with TypeScript errors:**
- Run `npm run typecheck` to identify issues
- Ensure all dependencies are installed: `npm install`

**Database connection errors:**
- Verify `DATABASE_URL` is set correctly
- Test connection: `npx prisma db push`
- Check database is accessible from deployment environment

**Contract interaction failures:**
- Verify `NEXT_PUBLIC_REGISTRY_ADDRESS` is correct mainnet address
- Ensure contract is deployed and verified on Base
- Check wallet has sufficient ETH for gas

**Ponder indexer not syncing:**
- Check Ponder logs for errors
- Verify RPC URLs are correct and responsive
- Ensure Ponder database is accessible

## 🎯 Post-Launch Monitoring

### First 24 Hours:
- [ ] Monitor error rates every hour
- [ ] Check database performance
- [ ] Verify smart contract interactions
- [ ] Monitor API response times
- [ ] Track user activity and engagement

### First Week:
- [ ] Review all error logs
- [ ] Analyze performance metrics
- [ ] Gather user feedback
- [ ] Plan improvements based on data
- [ ] Schedule first database backup verification

---

## ✅ Final Sign-Off

- [ ] All critical items checked
- [ ] All team members reviewed checklist
- [ ] Deployment approved by tech lead
- [ ] Rollback plan documented and tested
- [ ] Monitoring and alerts configured
- [ ] On-call schedule established

**Deployment Date:** _______________

**Deployed By:** _______________

**Approved By:** _______________
