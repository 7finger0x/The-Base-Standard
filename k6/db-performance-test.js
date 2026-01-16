/**
 * k6 Performance Test: Database Query Performance
 * Tests database query performance under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const dbQueryTime = new Trend('db_query_time');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    db_query_time: ['p(95)<500'],  // 95% of DB queries < 500ms
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test reputation endpoint (requires DB query)
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/api/reputation?address=0x1234567890123456789012345678901234567890`);
  const queryTime = Date.now() - startTime;

  check(res, {
    'reputation query succeeds': (r) => r.status === 200 || r.status === 401,
  });

  dbQueryTime.add(queryTime);

  sleep(1);

  // Test leaderboard (complex DB query)
  const leaderboardStart = Date.now();
  const leaderboardRes = http.get(`${BASE_URL}/api/leaderboard?limit=100`);
  const leaderboardTime = Date.now() - leaderboardStart;

  check(leaderboardRes, {
    'leaderboard query succeeds': (r) => r.status === 200,
  });

  dbQueryTime.add(leaderboardTime);

  sleep(1);
}
