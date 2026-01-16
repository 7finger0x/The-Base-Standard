/**
 * k6 Performance Test: API Load Testing
 * Tests API endpoint performance under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },     // Stay at 10 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },     // Stay at 50 users
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },    // Stay at 100 users
    { duration: '30s', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests < 2s
    http_req_failed: ['rate<0.01'],      // < 1% errors
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(healthRes.status !== 200);
  apiResponseTime.add(healthRes.timings.duration);

  sleep(1);

  // Test reputation endpoint (with mock address)
  const reputationRes = http.get(`${BASE_URL}/api/reputation?address=0x1234567890123456789012345678901234567890`);
  check(reputationRes, {
    'reputation status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'reputation response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  errorRate.add(reputationRes.status >= 400);
  apiResponseTime.add(reputationRes.timings.duration);

  sleep(1);

  // Test leaderboard endpoint
  const leaderboardRes = http.get(`${BASE_URL}/api/leaderboard?limit=10`);
  check(leaderboardRes, {
    'leaderboard status is 200': (r) => r.status === 200,
    'leaderboard response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  errorRate.add(leaderboardRes.status >= 400);
  apiResponseTime.add(leaderboardRes.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'test-results/load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
