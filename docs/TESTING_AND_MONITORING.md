# Testing and Monitoring Setup

**Last Updated**: 2025-01-16  
**Status**: ✅ Complete

## 📋 Overview

This document outlines the complete testing and monitoring infrastructure for The Base Standard, including E2E tests, performance tests, error tracking, and logging.

---

## 🧪 End-to-End Testing

### Setup

**Framework**: Playwright  
**Location**: `tests/e2e/`

### Installation

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Test Suites

1. **Wallet Connection** (`wallet-connection.spec.ts`)
   - Landing page display
   - Connect wallet button
   - Network indicator
   - Wallet connection modal
   - Sign-in flow

2. **Reputation Display** (`reputation-display.spec.ts`)
   - Score calculation and display
   - Tier badge rendering
   - Score breakdown component
   - API error handling

3. **Badge Minting** (`badge-minting.spec.ts`)
   - Mint eligibility check
   - Transaction data generation
   - Already minted badge handling
   - Error scenarios

4. **Frame Interactions** (`frame-interactions.spec.ts`)
   - Frame page loading
   - Farcaster SDK integration
   - Share score action
   - Frame API endpoints

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/wallet-connection.spec.ts
```

### Configuration

See `playwright.config.ts` for:
- Browser configurations (Chrome, Firefox, Safari, Mobile)
- Test retry settings
- Screenshot/video capture
- Web server setup

---

## ⚡ Performance Testing

### Setup

**Framework**: k6  
**Location**: `k6/`

### Installation

```bash
# macOS/Linux
brew install k6

# Windows
choco install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### Test Scripts

1. **API Load Test** (`api-load-test.js`)
   - Tests: `/api/health`, `/api/reputation`, `/api/leaderboard`
   - Load stages: 10 → 50 → 100 users
   - Thresholds: 95% requests < 2s, < 1% errors

2. **Database Performance Test** (`db-performance-test.js`)
   - Tests database query performance
   - Load stages: 20 → 50 users
   - Thresholds: 95% queries < 500ms

### Running Performance Tests

```bash
# Run API load test
npm run test:perf

# Run database performance test
npm run test:perf:db

# Run with custom base URL
BASE_URL=https://production.example.com k6 run k6/api-load-test.js
```

### Performance Metrics

- **Response Time**: p50, p95, p99 percentiles
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Database Query Time**: Query execution time

---

## 🔍 Error Tracking (Sentry)

### Setup

**Service**: Sentry  
**Location**: `src/lib/monitoring/sentry.ts`

### Configuration

1. **Install Sentry** (when ready for production):

```bash
npm install @sentry/nextjs
```

2. **Environment Variables**:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=base-standard
SENTRY_AUTH_TOKEN=your-auth-token
```

3. **Initialize Sentry**:

The `sentry.ts` module provides:
- `initSentry()` - Initialize error tracking
- `captureException()` - Capture exceptions
- `captureMessage()` - Capture messages
- `setUserContext()` - Set user context
- `addBreadcrumb()` - Add debugging breadcrumbs

### Usage

```typescript
import { captureException, setUserContext } from '@/lib/monitoring/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, { context: 'api/reputation' });
}

// Set user context
setUserContext(userId, address);
```

### Alerts Configured

- **API Errors**: > 10 errors/minute
- **Database Health**: Connection failures
- **Chainlink Balance**: < 0.1 LINK

---

## 📊 Logging

### Enhanced Logger

**Location**: `src/lib/monitoring/logger.ts`

### Features

- **Structured Logging**: JSON format for aggregation
- **Log Levels**: debug, info, warn, error
- **Request Tracking**: Request ID correlation
- **User Context**: User ID tracking
- **Error Context**: Stack traces and context

### Usage

```typescript
import { createLogger } from '@/lib/monitoring/logger';

const logger = createLogger('api/reputation');

logger.info('Processing request', { address });
logger.error('Failed to fetch data', error, { address });
```

### Log Aggregation

**Environment Variable**:
```bash
LOG_AGGREGATION_URL=https://your-log-service.com/api/logs
```

Supported services:
- Datadog
- LogRocket
- Axiom
- Custom webhook

### Log Retention

- **Development**: Console output only
- **Production**: 
  - Structured JSON logs
  - Sent to aggregation service
  - Retention: 30 days (configurable)

---

## 🚨 Monitoring & Alerts

### Health Checks

**Location**: `src/lib/monitoring/alerts.ts`

### Monitored Metrics

1. **API Errors**
   - Threshold: 10 errors/minute
   - Alert: Critical

2. **Database Health**
   - Connection status
   - Response time monitoring
   - Alert: Critical if unhealthy

3. **Chainlink Balance**
   - Minimum: 0.1 LINK
   - Alert: Critical if below threshold

### Alert Configuration

**Environment Variable**:
```bash
ALERT_WEBHOOK_URL=https://your-monitoring-service.com/webhook
```

### Alert Types

- `api_errors` - API error threshold exceeded
- `database_health` - Database connection issues
- `chainlink_balance` - Low Chainlink upkeep balance

### Uptime Monitoring

**Recommended Services**:
- UptimeRobot (free tier)
- Pingdom
- StatusCake
- Custom health check endpoint: `/api/health`

**Health Check Endpoint**:
```bash
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "database": "healthy",
  "rpc": "healthy",
  "timestamp": "2025-01-16T12:00:00Z"
}
```

---

## 📈 Test Coverage

### Unit Tests
- **Location**: `tests/`
- **Framework**: Vitest
- **Coverage**: `npm run test:coverage`

### E2E Tests
- **Location**: `tests/e2e/`
- **Framework**: Playwright
- **Coverage**: Wallet, Reputation, Badge, Frame flows

### Performance Tests
- **Location**: `k6/`
- **Framework**: k6
- **Coverage**: API endpoints, Database queries

---

## 🔧 Configuration Files

1. **Playwright**: `playwright.config.ts`
2. **k6**: `k6/api-load-test.js`, `k6/db-performance-test.js`
3. **Sentry**: `src/lib/monitoring/sentry.ts`
4. **Logger**: `src/lib/monitoring/logger.ts`
5. **Alerts**: `src/lib/monitoring/alerts.ts`

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 📝 Next Steps

1. **Set up Sentry account** and configure DSN
2. **Configure log aggregation service** (Datadog, etc.)
3. **Set up uptime monitoring** (UptimeRobot, etc.)
4. **Configure alert webhooks** for critical alerts
5. **Run performance tests** in staging environment
6. **Set up CI/CD** for automated testing

---

**Status**: All testing and monitoring infrastructure is in place! 🎉
