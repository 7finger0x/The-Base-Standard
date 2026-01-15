# Tier System Comparison: Legacy vs Recalibrated

**Date:** January 10, 2026

## Overview

This document compares the legacy tier system with the recalibrated system designed for the mature Base ecosystem.

## Tier Thresholds

### Legacy System (2023-2024)

| Tier | Score Range | Description |
|------|-------------|-------------|
| Novice | 0-99 | Just getting started |
| Bronze | 100-499 | Active participant |
| Silver | 500-849 | Established presence |
| Gold | 850-999 | Power user |
| BASED | 1000+ | OG Status |

### Recalibrated System (2025+)

| Tier | Score Range | Target % | Description |
|------|-------------|----------|-------------|
| TOURIST | 0-350 | Bottom 40% | Low retention, one-time users |
| RESIDENT | 351-650 | 40th-75th | Average active users |
| BUILDER | 651-850 | 75th-95th | Power users with diversity |
| BASED | 851-950 | 95th-99th | **Top 5% Elite** (hard gate) |
| LEGEND | 951-1000 | Top 1% | Ecosystem leaders |

## Key Differences

### 1. Score Scale
- **Legacy**: 0-6365 (complex, hard to understand)
- **Recalibrated**: 0-1000 (simple, intuitive)

### 2. BASED Tier Floor
- **Legacy**: 1000 points
- **Recalibrated**: **851 points** (but harder to achieve)

### 3. Tier Count
- **Legacy**: 5 tiers
- **Recalibrated**: 5 tiers (but different distribution)

### 4. Difficulty Curve
- **Legacy**: Linear progression
- **Recalibrated**: Exponential (harder at top)

## Scoring Philosophy

### Legacy: Volume-Based
- Rewards transaction count
- Simple time accumulation
- Easy to game with spam

### Recalibrated: Value-Based
- Rewards capital commitment
- Emphasizes diversity
- Requires social proof
- Includes decay mechanism

## Migration Impact

### User Experience
- **Legacy BASED users**: May drop to BUILDER tier
- **Legacy Gold users**: May drop to RESIDENT tier
- **New requirements**: Must demonstrate value, not just volume

### Psychological Impact
- **Loss Aversion**: Users fear losing status
- **Goal Gradient**: Clear path to BASED (851)
- **Status Signaling**: BASED = Top 5% (exclusive)

## Implementation

### Feature Flag
```bash
ENABLE_PVC_SCORING=true
ENABLE_RECALIBRATED_TIERS=true
```

### Backward Compatibility
- Legacy scores still calculated
- Can compare both systems
- Gradual migration path

---

**See Also:**
- `docs/TIER_RECALIBRATION.md` - Detailed recalibration guide
- `docs/PVC_FRAMEWORK.md` - PVC framework documentation
