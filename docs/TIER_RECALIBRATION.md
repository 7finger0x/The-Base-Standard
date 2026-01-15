# Tier Recalibration: Harder Thresholds for Mature Base Ecosystem

**Date:** January 10, 2026  
**Version:** 2.0.0  
**Status:** ✅ Implemented

## Executive Summary

The Base ecosystem has grown 30x in revenue from 2023 to 2025, making legacy tier thresholds obsolete. This document outlines the recalibrated tier system designed for a mature L2 ecosystem, with significantly harder requirements for the "BASED" tier.

## The Problem: Ecosystem Inflation

### Growth Metrics (2023-2025)
- **Revenue Growth**: $2.5M → $14.7M → $75.4M (30x increase)
- **Transaction Volume**: 4.5M+ daily transactions
- **Market Share**: 5% → 63% of L2 revenue

### Impact on Reputation
- A score that was top 1% in 2023 is now median in 2025
- Legacy thresholds too easy for mature ecosystem
- "BASED" tier lost scarcity value

## Recalibrated Tier System

### New Tier Architecture

| Tier | Score Range | Target Percentile | Difficulty Assessment |
|------|-------------|-------------------|----------------------|
| **TOURIST** | 0-350 | Bottom 40% | Expanded floor. Catches low-retention users and one-time bridgers |
| **RESIDENT** | 351-650 | 40th-75th | The "Average" Active. Requires sustained activity (>3 months) |
| **BUILDER** | 651-850 | 75th-95th | The "Hard" Gate. High volume + diversity + social proof |
| **BASED** | 851-950 | 95th-99th | **Top 5% Elite**. Requires DegenScore-level proficiency |
| **LEGEND** | 951-1000 | Top 1% | The Outlier. Ecosystem leaders and high-impact developers |

### Key Changes

1. **BASED Tier Floor Raised**: 850 → **851** (hard gate)
2. **New LEGEND Tier**: 951-1000 (top 1%)
3. **Expanded TOURIST Tier**: 0-350 (catches casual users)
4. **Score Scale**: Changed from 0-6365 to **0-1000** for clarity

## Three-Pillar Scoring System

### Pillar 1: Capital Efficiency & Commitment (Max 400 points)

**Emphasizes commitment over volume:**

- **Liquidity Duration**: 
  - < 7 days = 0 points (hard rule)
  - 7-30 days = base score
  - > 30 days = 1.5x multiplier

- **Lending Utilization**: 
  - Borrowing on Morpho/Aave indicates active management
  - Max 100 points

- **Volume Tiers**:
  - $1k-$10k: 50 points
  - $10k-$100k: 150 points
  - $100k+: 300 points

- **Gas Usage**: Logarithmic scoring (prevents whale dominance)

### Pillar 2: Ecosystem Diversity (Max 300 points)

**Forces exploration of multiple protocols:**

- **Explorer Metric**: 10 points per unique protocol
- **Threshold**: Need 30 distinct protocols for max points
- **Vintage Bonus**: Interactions with contracts >1 year old
- **Category Diversity**: Bonus for using different protocol types

**Rationale**: Bots farm single interactions. Genuine users explore.

### Pillar 3: Identity & Social Proof (Max 300 points)

**Leverages human element for Sybil resistance:**

- **Farcaster Integration**:
  - Linking FID: 50 points
  - OpenRank Top 10%: +100 points
  - OpenRank Top 20%: +75 points

- **Wallet Tenure**:
  - < 3 months: 0.5x multiplier (penalty)
  - 1+ year: +50 points (loyalty bonus)

- **Coinbase Verification**: +50 points (high-trust anchor)

- **Creator Capital**: 30% of Zora creator score

## Score Decay Mechanism

**Maintains "hard" tier requirements through activity:**

- **Inactivity Penalty**: 5% decay per 30 days of inactivity
- **Maximum Decay**: 50% (after 300 days)
- **Implication**: BASED users cannot retire - must remain active

**Formula**:
```
decayMultiplier = 1.0 - min(0.5, (daysSinceLastActivity / 30) * 0.05)
```

## BASED Tier Requirements

To achieve BASED status (851+), a user must demonstrate:

1. **Capital Commitment**: 
   - Liquidity positions >30 days OR
   - High volume tier ($100k+) OR
   - Active lending utilization

2. **Ecosystem Diversity**:
   - 20-30 unique protocol interactions
   - Multiple protocol categories
   - Vintage contract interactions

3. **Social Proof**:
   - Farcaster OpenRank Top 20% OR
   - Coinbase verification + active tenure
   - Creator activity on Zora

4. **Active Maintenance**:
   - No 30+ day inactivity periods
   - Consistent monthly activity

## Comparative Benchmarking

### DegenScore Beacon
- **Threshold**: 700 points
- **Perception**: "Not easy" - top echelon of DeFi
- **Base Adjustment**: 700 on Mainnet ≈ 850 on L2 (cheaper fees)

### Talent Protocol
- **Expert**: 80+
- **Master**: 250+ (3x gap)
- **Implication**: Need similar gap between BUILDER and BASED

### OpenRank
- **Top 1%**: Elite tier
- **Top 10%**: High reputation
- **Integration**: BASED requires Top 20% minimum

## Implementation Status

### ✅ Completed
- [x] Recalibrated tier thresholds
- [x] Three-pillar scoring system
- [x] Score decay mechanism
- [x] Capital commitment metrics
- [x] Diversity scoring
- [x] Identity & social proof integration

### 🚧 In Progress
- [ ] Liquidity position tracking
- [ ] Protocol category mapping
- [ ] Vintage contract detection
- [ ] Lending utilization calculation

### 📋 Planned
- [ ] Dynamic percentile-based tiers
- [ ] Grandfathering mechanism for legacy users
- [ ] Educational "Path to BASED" campaign
- [ ] Utility gating for BASED tier

## Migration Strategy

### Option A: Hard Reset (Recommended)
- All users recalculated with new thresholds
- 30-day grace period for users to meet new requirements
- Signals strong commitment to meritocracy

### Option B: Legacy Status
- Previous BASED users keep "Legacy BASED" badge
- Must meet new requirements for current utility
- Gradual migration

## Psychological Design

### Goal Gradient Effect
- Users accelerate behavior as they approach goals
- BASED tier (851) creates clear target
- LEGEND tier (951) prevents ceiling effect

### Loss Aversion
- Score decay creates fear of losing status
- Motivates continued activity
- Prevents "retirement" at top tier

### Status Signaling
- BASED tier = Top 5% (exclusive)
- LEGEND tier = Top 1% (elite)
- Clear differentiation for status

## Technical Implementation

### Score Calculation
```typescript
// Recalibrated formula
S_Total = M × D × min(1000, (w_T × T + w_C × C + w_D × D + w_I × I))

Where:
- M = Sybil multiplier (1.0 - 1.7)
- D = Decay multiplier (0.5 - 1.0)
- T = Tenure vector (0-365)
- C = Capital pillar (0-400)
- D = Diversity pillar (0-300)
- I = Identity pillar (0-300)
```

### Tier Determination
```typescript
if (score >= 951) return 'LEGEND';    // Top 1%
if (score >= 851) return 'BASED';    // Top 5% (hard gate)
if (score >= 651) return 'BUILDER';  // Top 25%
if (score >= 351) return 'RESIDENT'; // 40th-75th
return 'TOURIST';                     // Bottom 40%
```

## Benefits

1. **Restored Scarcity**: BASED tier now truly exclusive (top 5%)
2. **Sybil Resistance**: Multi-pillar system prevents gaming
3. **Active Maintenance**: Decay mechanism prevents stagnation
4. **Meritocratic**: Rewards value creation, not just volume
5. **Scalable**: Adapts to ecosystem growth

## Next Steps

1. **Data Integration**: Connect liquidity tracking, protocol registry
2. **Testing**: Validate against known user profiles
3. **Rollout**: Announce 30 days in advance
4. **Education**: "Path to BASED" campaign
5. **Monitoring**: Track tier distribution post-launch

---

**For implementation details, see:**
- `src/lib/scoring/pvc-framework.ts`
- `src/lib/scoring/metrics-collector.ts`

**Related Documents:**
- `docs/PVC_FRAMEWORK.md` - Original PVC framework
- `PVC_IMPLEMENTATION_STATUS.md` - Implementation tracking
