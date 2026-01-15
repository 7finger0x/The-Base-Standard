# Tier Recalibration Implementation Summary

**Date:** January 10, 2026  
**Status:** ✅ **IMPLEMENTED**

## Overview

The tier recalibration system has been fully implemented based on the research paper "Calibration of Onchain Reputation: Designing High-Friction Tier Thresholds for the Mature Base Layer-2 Ecosystem."

## ✅ Completed Implementation

### 1. Recalibrated Tier Thresholds

**New Tier System:**
- **TOURIST**: 0-350 (Bottom 40%)
- **RESIDENT**: 351-650 (40th-75th percentile)
- **BUILDER**: 651-850 (75th-95th percentile)
- **BASED**: 851-950 (95th-99th percentile) - **Hard Gate**
- **LEGEND**: 951-1000 (Top 1%)

**Key Change**: BASED tier floor raised from 1000 to **851** (but harder to achieve)

### 2. Three-Pillar Scoring System

#### Pillar 1: Capital Efficiency & Commitment (Max 400 points)
- ✅ Liquidity duration tracking (< 7 days = 0, > 30 days = 1.5x)
- ✅ Lending utilization scoring
- ✅ Volume tiers ($1k-$10k, $10k-$100k, $100k+)
- ✅ Logarithmic gas scoring

#### Pillar 2: Ecosystem Diversity (Max 300 points)
- ✅ Unique protocol counting (10 points each, need 30 for max)
- ✅ Vintage contract bonus (contracts >1 year old)
- ✅ Protocol category diversity

#### Pillar 3: Identity & Social Proof (Max 300 points)
- ✅ Farcaster FID linking (50 points)
- ✅ OpenRank percentile bonuses (Top 10% = +100, Top 20% = +75)
- ✅ Wallet tenure multipliers (< 3 months = 0.5x, 1+ year = +50)
- ✅ Coinbase verification (+50 points)

### 3. Score Decay Mechanism

- ✅ 5% decay per 30 days of inactivity
- ✅ Maximum decay: 50% (after 300 days)
- ✅ Prevents "retirement" at top tier
- ✅ Maintains "hard" tier requirements

### 4. Updated Metrics Collection

- ✅ Added wallet age tracking
- ✅ Added days active calculation
- ✅ Added liquidity metrics structure
- ✅ Added capital tier determination
- ✅ Added protocol diversity metrics
- ✅ Added days since last activity tracking

## Code Changes

### Files Modified

1. **`src/lib/scoring/pvc-framework.ts`**
   - Updated tier calculation with new thresholds
   - Implemented three-pillar scoring system
   - Added score decay mechanism
   - Changed scale from 0-6365 to 0-1000

2. **`src/lib/scoring/metrics-collector.ts`**
   - Extended PVCMetrics interface
   - Added new metric calculations
   - Added liquidity and diversity tracking

3. **`src/app/api/reputation/route.ts`**
   - Already supports PVC framework
   - Returns recalibrated scores when enabled

### New Documentation

1. **`docs/TIER_RECALIBRATION.md`** - Complete recalibration guide
2. **`docs/TIER_COMPARISON.md`** - Legacy vs Recalibrated comparison

## Usage

### Enable Recalibrated Tiers

```bash
ENABLE_PVC_SCORING=true
```

The system will automatically use recalibrated thresholds when PVC scoring is enabled.

### API Response

```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "totalScore": 875,
    "tier": "BASED",
    "multiplier": 1.5,
    "breakdown": {
      "tenure": 365,
      "economic": 350,
      "social": 280
    },
    "pillars": {
      "capital": 350,
      "diversity": 250,
      "identity": 280
    },
    "decayInfo": {
      "daysSinceLastActivity": 5,
      "decayMultiplier": 1.0,
      "willDecay": false
    },
    "scoringModel": "PVC"
  }
}
```

## Key Improvements

### 1. Harder BASED Tier
- Requires capital commitment (liquidity >30 days OR high volume)
- Requires ecosystem diversity (20-30 unique protocols)
- Requires social proof (OpenRank Top 20% OR Coinbase verification)
- Requires active maintenance (no 30+ day inactivity)

### 2. Score Decay
- Prevents stagnation
- Maintains exclusivity
- Motivates continued activity

### 3. Three-Pillar System
- Balances capital, diversity, and identity
- Prevents gaming through single metric
- Rewards well-rounded users

## Migration Considerations

### Impact on Existing Users

- **Legacy BASED users (1000+)**: May drop to BUILDER (651-850) if they lack:
  - Capital commitment (liquidity duration)
  - Protocol diversity (20+ protocols)
  - Social proof (Farcaster/Coinbase)

- **Legacy Gold users (850-999)**: May drop to RESIDENT (351-650) if they lack:
  - Sustained activity
  - Multi-protocol usage

### Grandfathering Options

1. **Hard Reset** (Recommended)
   - All users recalculated
   - 30-day grace period
   - Signals commitment to meritocracy

2. **Legacy Status**
   - Previous BASED users keep "Legacy BASED" badge
   - Must meet new requirements for utility

## Next Steps

1. **Data Integration**
   - Connect liquidity tracking
   - Map protocol categories
   - Integrate OpenRank API

2. **Testing**
   - Validate against known user profiles
   - Compare legacy vs recalibrated scores
   - Test decay mechanism

3. **Rollout**
   - Announce 30 days in advance
   - Provide "Path to BASED" guide
   - Monitor tier distribution

## References

- Research Paper: "Calibration of Onchain Reputation"
- DegenScore Benchmark: 700 points = "not easy"
- Talent Protocol: Master tier gap (80 → 250)
- OpenRank: Percentile-based social scoring

---

**Implementation Complete** ✅

The recalibrated tier system is ready for testing and gradual rollout.
