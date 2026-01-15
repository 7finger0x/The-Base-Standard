# The Base Standard

On-chain reputation scoring across Base and Zora networks - establishing the standard for Base L2 credibility.

## Features

- **Multi-Wallet Identity**: Link multiple wallets to aggregate your reputation score
- **Cross-Chain Scoring**: Aggregates activity from Base and Zora networks
- **Timeliness Rewards**: Bonus points for early NFT mints (< 24h)
- **EIP-712 Secure Linking**: Cryptographically secure wallet linking

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Web3**: OnchainKit, wagmi v2, viem
- **Contracts**: Foundry (Solidity 0.8.23)
- **Data Layer**: Ponder (optional, for indexing)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Foundry tests
npm run foundry:test
```

## Tier System

| Tier     | Score Range | Target %   | Description                  |
|----------|-------------|------------|------------------------------|
| TOURIST  | 0-350       | Bottom 40% | Low retention / one-time     |
| RESIDENT | 351-650     | 40th-75th  | Average active users         |
| BUILDER  | 651-850     | 75th-95th  | Power users with diversity   |
| BASED    | 851-950     | 95th-99th  | **Top 5% Elite** (Hard Gate) |
| LEGEND   | 951-1000    | Top 1%     | Ecosystem leaders            |

## Score Calculation

```
Total Score = Base Tenure + Zora Mints + Timeliness Bonus

- Base Tenure: Days since first transaction on Base
- Zora Mints: Number of NFTs minted on Zora
- Timeliness: Bonus for minting within 24h of collection launch
```

## Smart Contract

The `ReputationRegistry` contract handles:
- Multi-wallet linking via EIP-712 signatures
- Score storage and tier calculation
- Batch score updates (for agent)

Deploy:
```bash
cd foundry
forge script script/Deploy.s.sol --broadcast --verify
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` - Database connection string (SQLite for dev, PostgreSQL for prod)
- `NEXT_PUBLIC_BASE_RPC_URL` - Base L2 RPC endpoint
- `NEXT_PUBLIC_REGISTRY_ADDRESS` - Deployed ReputationRegistry contract address
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Coinbase OnchainKit API key
- `ADMIN_API_KEY` - API key for admin endpoints (optional)

See `.env.example` for all available variables.

## Production Deployment

### Quick Deploy to Vercel

```bash
# Run pre-deployment checks
npm run pre-deploy

# Deploy to Vercel
vercel --prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t base-standard:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production base-standard:latest
```

### Database Setup

```bash
# Setup production database
npm run db:setup

# Run migrations
npm run db:migrate
```

See [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) for detailed deployment procedures.

## Testing

```bash
# Run all tests
npm run test:all

# Test frontend only
npm run test:frontend

# Test endpoints (after deployment)
npm run test:endpoints [base-url]
```

## Documentation

### User & Developer Guides
- [User Guide](./docs/USER_GUIDE.md) - End-user documentation
- [API Documentation](./docs/API_DOCUMENTATION.md) - API reference
- [Project Summary](./docs/PROJECT_SUMMARY.md) - High-level project overview

### Deployment & Operations
- [Quick Start Production](./docs/deployment/QUICK_START_PRODUCTION.md) - 5-minute deployment guide
- [Deployment Runbook](./docs/DEPLOYMENT_RUNBOOK.md) - Detailed deployment procedures
- [Production Checklist](./docs/deployment/PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [Production Project Paper](./docs/deployment/PRODUCTION_PROJECT_PAPER.md) - Technical specification
- [Incident Response](./docs/INCIDENT_RESPONSE.md) - Incident handling

### Technical Documentation
- [PVC Framework](./docs/PVC_FRAMEWORK.md) - Scoring system framework
- [Tier Recalibration](./docs/TIER_RECALIBRATION.md) - Tier system design
- [Identity System](./docs/IDENTITY_SYSTEM.md) - Multi-wallet identity
- [Environment Variables](./docs/ENV_VARIABLES.md) - Configuration guide

### Status & History
- [Project Status](./docs/PROJECT_STATUS.md) - Current completion status
- [Implementation Status](./docs/status/) - Historical implementation summaries
- [Documentation Index](./docs/DOCUMENTATION_INDEX.md) - Complete documentation catalog

## Production URLs

- **Production**: [base-standard.xyz](https://base-standard.xyz) (pending)
- **API**: [api.base-standard.xyz](https://api.base-standard.xyz) (pending)
- **Status**: [status.base-standard.xyz](https://status.base-standard.xyz) (pending)
- **Docs**: [docs.base-standard.xyz](https://docs.base-standard.xyz) (pending)

## License

MIT
