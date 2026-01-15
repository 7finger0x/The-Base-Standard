# Provable Value Contribution (PVC) Framework

**Version:** 2.0.0 (Recalibrated)
**Last Updated:** January 10, 2026

## Overview

The Provable Value Contribution (PVC) framework replaces the linear tenure model with a multi-dimensional scoring system designed for algorithmic fairness, Sybil resistance, and meritocratic reputation assessment. The system uses a **0-1000 score scale** calibrated for the mature Base ecosystem.

## Key Principles

### 1. Active Participation Over Passive Existence
- **Old**: Linear points per day.
- **New**: Rewards consistent monthly activity and penalizes inactivity via score decay.

### 2. Logarithmic Economic Metrics
- Prevents whale dominance
- Rewards "skin in the game" without excluding smaller users
- Uses logarithmic scaling for gas and volume metrics.

### 3. Social Graph Verification
- Uses EigenTrust/OpenRank for Farcaster scoring
- Prevents Sybil clusters from achieving high scores
- Rewards identity verification (Coinbase, Gitcoin Passport).

### 4. Quality Over Quantity
- Rewards unique protocol interactions (Diversity).
- Rewards liquidity duration (Commitment).
- Rewards sustained behavior over spam.

## Scoring Components: The Three Pillars

The score (0-1000) is derived from three main pillars, plus multipliers.

### Pillar 1: Capital Efficiency & Commitment (Max 400 points)
Focuses on economic commitment and efficient usage of capital.

- **Liquidity Duration**: 
  - < 7 days: 0 points
  - > 30 days: 1.5x multiplier on liquidity score
- **Lending Utilization**: Rewards active management on protocols like Morpho/Aave.
- **Volume Tiers**: 
  - $1k-$10k: Low tier
  - $10k-$100k: Mid tier
  - $100k+: High tier
- **Gas Usage**: Logarithmic scoring based on ETH spent on gas.

### Pillar 2: Ecosystem Diversity (Max 300 points)
Encourages exploration across the Base ecosystem.

- **Unique Protocols**: 10 points per unique protocol interacted with (Target: 30+).
- **Vintage Contracts**: Bonus for interacting with contracts >1 year old.
- **Protocol Categories**: Bonus for diversity across DEX, Lending, Gaming, NFT, etc.

### Pillar 3: Identity & Social Proof (Max 300 points)
Leverages on-chain identity and social graphs for Sybil resistance.

- **Farcaster Integration**:
  - Linked FID: 50 points
  - OpenRank Top 10%: +100 points
  - OpenRank Top 20%: +75 points
- **Wallet Tenure**:
  - < 3 months: 0.5x penalty
  - > 1 year: +50 points bonus
- **Coinbase Verification**: +50 points for verified Coinbase users.
- **Creator Capital**: Derived from Zora creator activity and secondary volume.

## Score Decay Mechanism

To maintain the exclusivity of high tiers, scores decay during periods of inactivity.

- **Trigger**: Inactivity > 30 days.
- **Rate**: 5% decay per 30-day period.
- **Cap**: Maximum 50% total decay.
- **Recovery**: Activity resets the decay timer (but lost points must be re-earned or decay multiplier resets).

## Total Score Calculation

```
S_Total = M × min(6365, (w_T × T + w_E × E + w_S × S))

Where:
- M = Sybil Resistance Multiplier (1.0 - 1.7)
- T = Active Tenure Vector (0-365)
- E = Economic Impact Vector (logarithmic/quadratic)
- S = Social & Creator Capital Vector
- w_T = 0.25 (25% weight)
- w_E = 0.40 (40% weight)
- w_S = 0.15 (15% weight)
```

## Tier System

| Tier | Score Range | Description |
|------|-------------|-------------|
| DIAMOND | 5000+ | Top tier |
| PLATINUM | 3000-4999 | High tier |
| GOLD | 1500-2999 | Mid-high tier |
| SILVER | 850-1499 | Mid tier |
| BRONZE | 500-849 | Low-mid tier |
| NOVICE | 100-499 | Entry tier |
| UNRANKED | 0-99 | Below threshold |

**Future**: Dynamic percentile-based tiers (Top 1%, 5%, 20%)

## Implementation Status

### ✅ Completed
- PVC framework architecture
- Card scoring formulas
- Multiplier calculations
- Metrics collection structure

### 🚧 In Progress
- On-chain data collection
- Zora API integration
- Farcaster OpenRank integration
- EAS attestation queries
- Gitcoin Passport API

### 📋 Planned
- The Graph subgraph for historical data
- Merkle proof system for on-chain scores
- DAO governance for weight adjustments
- Dynamic percentile tiering

## Migration Path

1. **Phase 1**: Deploy PVC framework alongside linear model
2. **Phase 2**: A/B test both systems
3. **Phase 3**: Gradual migration with user opt-in
4. **Phase 4**: Full PVC adoption

## References

- Gitcoin 2.0 Whitepaper
- Optimism Retroactive Funding
- Arbitrum Airdrop Analysis
- EigenTrust Algorithm
- Quadratic Funding Principles

---

**For technical implementation details, see:**
- `src/lib/scoring/pvc-framework.ts`
- `src/lib/scoring/metrics-collector.ts`
