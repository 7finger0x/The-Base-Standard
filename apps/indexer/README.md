# BaseRank Ponder Indexer

This is the data indexing layer for BaseRank Protocol, built with [Ponder](https://ponder.sh/).

## What it does

The indexer monitors blockchain events and maintains a PostgreSQL database with:
- **Reputation scores** - Aggregated scores from Base tenure + Zora mints
- **Wallet linking** - Track multi-wallet identities
- **Zora NFT mints** - Track mints on Base and Zora networks
- **Historical snapshots** - Score changes over time

## Architecture

```
Blockchain Events
       ↓
   Ponder Indexer
       ↓
   PostgreSQL
       ↓
   REST API (Hono)
       ↓
   Frontend
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PONDER_RPC_URL_8453` - Base mainnet RPC URL
- `PONDER_RPC_URL_7777777` - Zora network RPC URL
- `REPUTATION_REGISTRY_ADDRESS` - Your deployed contract address

### 3. Update Start Block

Edit `ponder.config.ts` and set `startBlock` to your contract deployment block number for faster sync:

```typescript
ReputationRegistry: {
  startBlock: 12000000, // Change to your deployment block
}
```

Find your deployment block on BaseScan.

## Running

### Development (with hot reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

### Generate Types

```bash
npm run codegen
```

## API Endpoints

Once running, the indexer exposes these endpoints:

### Health Check
```
GET /health
```

### Get Reputation Score
```
GET /api/reputation/:address
```

Response:
```json
{
  "address": "0x...",
  "totalScore": 450,
  "tier": "Silver",
  "breakdown": {
    "baseTenure": { "score": 200, "days": 200, "firstTx": "2023-01-01" },
    "zoraMints": { "score": 150, "count": 15, "earlyMints": 3 },
    "timeliness": { "score": 100, "earlyAdopterCount": 3 }
  },
  "linkedWallets": ["0x...", "0x..."],
  "lastUpdated": "2024-01-09T12:00:00Z"
}
```

### Get Leaderboard
```
GET /api/leaderboard?limit=100&offset=0
```

### Get Tier Distribution
```
GET /api/stats/tiers
```

### Get Recent Mints
```
GET /api/mints/recent?limit=50
```

### Get Score History
```
GET /api/history/:address?days=30
```

## Database Schema

### Tables

- **account** - Main wallet addresses with scores
- **linked_wallet** - Secondary wallets linked to main accounts
- **zora_mint** - Individual NFT mint records
- **collection** - Zora collections being tracked
- **score_snapshot** - Historical score records

See `ponder.schema.ts` for full schema definition.

## Events Tracked

### ReputationRegistry Contract
- `WalletLinked` - When wallets are linked
- `WalletUnlinked` - When wallets are unlinked
- `ScoreUpdated` - When agent updates scores
- `TierUpdated` - When user's tier changes

### Zora 1155 Contracts
- `Purchased` - NFT mints
- `TransferSingle` - Individual token transfers (mints from 0x0)
- `TransferBatch` - Batch token transfers

## Score Calculation

The indexer calculates scores as:

```
Total Score = Base Tenure + Zora Mints + Timeliness

- Base Tenure: 1 point per day since first Base transaction
- Zora Mints: 10 points per NFT minted
- Timeliness: 100 bonus points per "early mint" (within 24h of collection launch)
```

Tiers:
- **Novice**: 0-99
- **Bronze**: 100-499
- **Silver**: 500-849
- **Gold**: 850-999
- **BASED**: 1000+

## Deployment

### Railway

1. Create new Railway project
2. Add PostgreSQL database
3. Set environment variables
4. Deploy:

```bash
railway up
```

5. Get public URL:

```bash
railway domain
```

### Render / Heroku

Similar process:
1. Connect to PostgreSQL
2. Set env vars
3. Deploy

## Monitoring

### Check Sync Status

```bash
curl https://your-indexer.railway.app/health
```

### View Logs

```bash
railway logs --tail 100
```

### Database Access

```bash
railway run psql
```

## Troubleshooting

### Indexer not syncing

1. Check `startBlock` is correct in config
2. Verify RPC URLs are accessible
3. Ensure contract address is correct
4. Check Railway logs for errors

### Database connection issues

1. Verify `DATABASE_URL` is set correctly
2. Check Railway PostgreSQL is running
3. Try connecting manually with `psql`

### Missing events

1. Verify contract emits events (check BaseScan)
2. Check ABI includes all events
3. Ensure `startBlock` is before deployment

## Development

### Adding New Events

1. Add event to ABI in `abis/`
2. Create handler in `src/` (e.g., `src/MyContract.ts`)
3. Import handler in `src/index.ts`
4. Test with `npm run dev`

### Modifying Schema

1. Edit `ponder.schema.ts`
2. Run `npm run codegen` to regenerate types
3. Restart indexer - Ponder auto-migrates

### Adding API Endpoints

Edit `src/api.ts`:

```typescript
ponder.get("/api/my-endpoint", async (c) => {
  const { db } = c;
  // Query database
  return c.json({ data });
});
```

## Performance Tips

1. Use appropriate `startBlock` to avoid syncing unnecessary history
2. Add database indexes for frequently queried fields (already done in schema)
3. Use Railway's connection pooling
4. Cache API responses on frontend

## Links

- [Ponder Documentation](https://ponder.sh/)
- [Hono Documentation](https://hono.dev/) (API framework)
- [Drizzle ORM](https://orm.drizzle.team/) (used by Ponder)

## Support

Check the main project README for support channels.
