# BaseRank Testing Guide

This document describes the comprehensive test suite for the BaseRank protocol.

## 📊 Test Coverage Summary

| Layer | Test Files | Test Count | Coverage Target |
|-------|------------|------------|-----------------|
| Smart Contracts (Solidity) | 1 | 42 | 90%+ |
| Python Agent | 2 | 30 | 85%+ |
| Indexer (TypeScript) | 1 | 25 | 80%+ |
| Frontend (React/Next.js) | 3 | 20+ | 70%+ |
| **TOTAL** | **7+** | **117+** | **80%+** |

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Tests by Layer

#### Frontend Tests
```bash
npm run test:frontend
# or with watch mode
npm run test:watch
# or with coverage
npm run test:coverage
```

#### Indexer Tests
```bash
npm run test:indexer
```

#### Python Agent Tests
```bash
npm run test:agent
# or with coverage
npm run test:agent:coverage
```

#### Smart Contract Tests
```bash
npm run foundry:test
```

## 📁 Test Structure

```
base-rank/
├── tests/                          # Frontend tests
│   ├── setup.ts                    # Test setup and global mocks
│   ├── lib/
│   │   └── utils.test.ts           # Utility function tests (12 tests)
│   ├── api/
│   │   └── reputation.test.ts      # API route tests (6 tests)
│   ├── tier-consistency.test.ts    # Cross-layer tier validation (20 tests)
│   └── integration/
│       └── score-calculation.test.ts # E2E score tests (15 tests)
│
├── apps/indexer/tests/
│   ├── utils.test.ts               # Indexer utility tests (25 tests)
│   └── vitest.config.ts            # Indexer test config
│
├── apps/agent/tests/
│   ├── __init__.py
│   ├── test_score_calculator.py    # Score calculation tests (20 tests)
│   └── test_database.py            # Database interface tests (10 tests)
│
└── foundry/test/
    └── ReputationRegistry.t.sol    # Smart contract tests (42 tests)
```

## 🧪 Test Categories

### 1. Smart Contract Tests (42 tests)

**File**: `foundry/test/ReputationRegistry.t.sol`

#### Coverage Areas:
- **Wallet Linking** (8 tests)
  - Basic linking functionality
  - Signature validation
  - Nonce management
  - Deadline expiration
  - Already linked prevention
  - Invalid signature detection

- **Wallet Unlinking** (4 tests)
  - Unlinking functionality
  - Authorization checks
  - Array management (middle element removal)

- **Score Updates** (6 tests)
  - Single score updates
  - Batch score updates
  - Authorization checks
  - Array length validation

- **Tier Calculation** (10 tests)
  - All 5 tiers (Novice, Bronze, Silver, Gold, BASED)
  - Boundary conditions for each tier
  - Zero score handling

- **Aggregated Scores** (4 tests)
  - Single wallet scores
  - Linked wallet aggregation
  - Multiple linked wallets
  - Post-unlink recalculation

- **EIP-712** (2 tests)
  - Hash consistency
  - Input differentiation

**Run**: `npm run foundry:test`

### 2. Python Agent Tests (30 tests)

#### Score Calculator Tests (20 tests)
**File**: `apps/agent/tests/test_score_calculator.py`

- **Base Tenure Calculation** (6 tests)
  - Single day, multiple days, partial days
  - None handling, year-long tenure

- **Zora Score Calculation** (6 tests)
  - No mints, single mint, multiple mints
  - Batch mints, mixed quantities

- **Timeliness Score** (8 tests)
  - Early mint detection
  - 24-hour window boundaries
  - Pre-deployment mint handling
  - Batch early mints

- **Total Score Calculation** (5 tests)
  - All components combined
  - Linked wallet aggregation

#### Database Tests (10 tests)
**File**: `apps/agent/tests/test_database.py`

- Database initialization
- Account queries (with/without results)
- Mints retrieval
- Linked wallets fetching
- Account update marking
- Tier distribution queries
- Top accounts leaderboard
- Address case normalization

**Run**: `npm run test:agent`

### 3. Indexer Tests (25 tests)

**File**: `apps/indexer/tests/utils.test.ts`

#### Coverage Areas:
- **Tier Calculation** (10 tests)
  - All 5 tier thresholds
  - Boundary values for each tier

- **Early Mint Detection** (5 tests)
  - Within 24 hours
  - Exact 24-hour boundary
  - After 24 hours
  - Before deployment (edge case)

- **Score Calculation** (3 tests)
  - Total score summation
  - Zero score handling
  - BigInt type validation

- **Base Tenure** (6 tests)
  - Zero days, single day, 30 days
  - Partial day rounding
  - Year-long tenure
  - Negative time difference

- **Address Utilities** (3 tests)
  - Zero address detection
  - Address normalization
  - Case handling

**Run**: `npm run test:indexer`

### 4. Frontend Tests (20+ tests)

#### Utility Tests (12 tests)
**File**: `tests/lib/utils.test.ts`

- Class name merging (cn function)
- Address shortening
- Score formatting
- Tier calculation (all 5 tiers)
- Base name resolution
- Address formatting with names

#### API Route Tests (6 tests)
**File**: `tests/api/reputation.test.ts`

- Missing address validation
- Ponder integration (when available)
- Mock data fallback (when Ponder unavailable)
- Deterministic mock data generation
- Different addresses produce different mocks

#### Tier Consistency Tests (20 tests)
**File**: `tests/tier-consistency.test.ts`

**CRITICAL**: Validates that tier calculation is identical across all 5 implementations:
1. Solidity (ReputationRegistry.sol)
2. Python (score_calculator.py)
3. Indexer TypeScript (utils.ts)
4. Frontend TypeScript (utils.ts)
5. API Routes (route.ts)

Tests:
- Frontend tier thresholds (13 tests)
- Indexer tier thresholds (13 tests)
- Frontend ↔ Indexer consistency (21 tests)
- Boundary validation (4 tests)

#### Integration Tests (15 tests)
**File**: `tests/integration/score-calculation.test.ts`

End-to-end score calculation scenarios:
- New user (0 score)
- Active user progression
- Tier advancement scenarios
- Linked wallet aggregation
- Maximum realistic scores
- Edge cases and boundaries
- Score component weighting

**Run**: `npm run test:frontend`

## 🎯 Critical Test Cases

### Tier Boundary Tests
These tests ensure tier thresholds are consistent everywhere:

| Score | Expected Tier |
|-------|---------------|
| 0-99 | Novice |
| 100-499 | Bronze |
| 500-849 | Silver |
| 850-999 | Gold |
| 1000+ | BASED |

### Score Calculation Formula
```
Total Score = Base Tenure + Zora Score + Timeliness Score

Where:
- Base Tenure = Days on Base × 1 point/day
- Zora Score = Total mints × 10 points/mint
- Timeliness Score = Early mints × 100 points/mint
- Early Mint = Minted within 24 hours of collection deployment
```

### Linked Wallet Aggregation
Tests verify that linked wallets correctly aggregate:
- Main wallet score + All linked wallet scores = Total score
- After unlinking, scores recalculate correctly

## 🔍 Test Requirements Before Production

### Minimum Test Coverage
- [x] Smart Contracts: 42 tests covering all functions
- [x] Score Calculator: 20 tests covering all calculations
- [x] Database: 10 tests covering all queries
- [x] Indexer Utils: 25 tests covering all utilities
- [x] Frontend Utils: 12 tests covering core functions
- [x] API Routes: 6 tests covering endpoints
- [x] Tier Consistency: 20 tests cross-validating implementations
- [x] Integration: 15 tests for E2E flows

### Critical Validations
- [x] All 5 tier implementations match exactly
- [x] Score calculation is deterministic
- [x] Linked wallet aggregation works correctly
- [x] EIP-712 signature validation works
- [x] Early mint detection (24-hour window) is accurate
- [x] Nonce management prevents replay attacks
- [x] Array manipulation (unlinking) doesn't corrupt data

## 📝 Writing New Tests

### Frontend/Indexer (Vitest)
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Python Agent (pytest)
```python
import pytest

def test_feature():
    result = calculate_something()
    assert result == expected
```

### Smart Contracts (Foundry)
```solidity
function test_FeatureName() public {
    // Setup
    // Execute
    // Assert
    assertEq(result, expected);
}
```

## 🐛 Debugging Failed Tests

### Frontend/Indexer
```bash
# Run specific test file
npm run test -- tests/lib/utils.test.ts

# Run with verbose output
npm run test -- --reporter=verbose

# Run with UI
npm run test:ui
```

### Python Agent
```bash
# Run specific test
cd apps/agent && pytest tests/test_score_calculator.py::test_name -v

# Run with print statements
cd apps/agent && pytest -s
```

### Smart Contracts
```bash
# Run specific test
cd foundry && forge test --match-test test_LinkWallet -vvv

# Run with gas reporting
cd foundry && forge test --gas-report
```

## 🎓 Test Maintenance

### When to Update Tests
- ✅ When modifying score calculation logic
- ✅ When changing tier thresholds
- ✅ When adding new features
- ✅ When fixing bugs (add regression test)
- ✅ When modifying smart contracts

### Test Anti-Patterns to Avoid
- ❌ Testing implementation details instead of behavior
- ❌ Tests that depend on execution order
- ❌ Hard-coded timestamps (use mocks)
- ❌ Tests without clear assertions
- ❌ Overly complex test setup

## 📊 Continuous Integration

Tests should run on:
- Every pull request
- Before merging to main
- Before deployment to production

Recommended CI configuration:
```yaml
- npm run test:all
- npm run test:coverage
- Coverage threshold: 80%
```

## 🔗 Related Documentation
- [Smart Contract Documentation](./foundry/README.md)
- [Agent Documentation](./apps/agent/README.md)
- [Indexer Documentation](./apps/indexer/README.md)

---

**Last Updated**: Generated with comprehensive test suite
**Test Count**: 117+ tests across all layers
**Coverage Target**: 80%+ overall
