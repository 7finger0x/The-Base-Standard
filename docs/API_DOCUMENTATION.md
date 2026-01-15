# The Base Standard - API Documentation

**Version:** 2.0.0 (Recalibrated)  
**Base URL:** `https://base-standard.xyz/api`  
**Last Updated:** January 10, 2026

## Overview

The Base Standard API provides programmatic access to reputation scores, leaderboards, and user data.

## Authentication

Most endpoints are public and do not require authentication. Admin endpoints require an API key:

```
X-API-Key: your-api-key
```

or

```
Authorization: Bearer your-api-key
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP address
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in window
  - `X-RateLimit-Reset`: Timestamp when limit resets
- **Response**: 429 Too Many Requests when limit exceeded

## Endpoints

### GET /api/health

Health check endpoint for monitoring system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-10T12:00:00.000Z",
  "uptime": 86400,
  "services": [
    {
      "name": "database",
      "status": "healthy",
      "responseTime": 15,
      "lastCheck": "2026-01-10T12:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200`: All services healthy
- `503`: One or more services degraded/unhealthy

---

### GET /api/reputation

Get reputation score for a wallet address.

**Query Parameters:**
- `address` (required): Ethereum address (0x + 40 hex chars)

**Example:**
```bash
curl "https://base-standard.xyz/api/reputation?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    "totalScore": 875,
    "tier": "BASED",
    "rank": 42,
    "totalUsers": 10000,
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
    "linkedWallets": [],
    "lastUpdated": "2026-01-10T12:00:00.000Z"
  },
  "timestamp": "2026-01-10T12:00:05.000Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid address format
- `500`: Server error

---

### GET /api/leaderboard

Get ranked list of users by reputation score.

**Query Parameters:**
- `limit` (optional): Number of results (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl "https://base-standard.xyz/api/leaderboard?limit=50&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
        "score": 980,
        "tier": "LEGEND"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "hasMore": true,
      "total": 10000
    }
  },
  "timestamp": "2026-01-10T12:00:05.000Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid parameters
- `500`: Server error

---

### POST /api/admin/update-score

Update user reputation score (Admin only).

**Headers:**
- `X-API-Key`: Admin API key (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "score": 500,
  "category": "manual_adjustment",
  "points": 100,
  "multiplier": 1.0,
  "metadata": {
    "reason": "Community contribution"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    "score": 500,
    "tier": "RESIDENT",
    "lastUpdated": "2026-01-10T12:00:00.000Z"
  },
  "timestamp": "2026-01-10T12:00:05.000Z"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized (missing/invalid API key)
- `422`: Validation error
- `500`: Server error

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

### Error Codes

- `BAD_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: Missing or invalid API key
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `WALLET_REQUIRED`: Wallet address parameter missing
- `WALLET_INVALID`: Invalid wallet address format
- `INTERNAL_SERVER_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

## CORS

CORS is enabled for all API endpoints. Configure allowed origins via `CORS_ALLOWED_ORIGINS` environment variable.

## Best Practices

1. **Cache Responses**: Reputation scores update every 5 seconds. Cache responses appropriately.
2. **Handle Errors**: Always check the `success` field and handle errors gracefully.
3. **Respect Rate Limits**: Implement exponential backoff when hitting rate limits.
4. **Validate Addresses**: Always validate Ethereum addresses before making requests.

## SDK & Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- React hooks

## Support

- **API Issues**: api-support@base-standard.xyz
- **Documentation**: [docs.base-standard.xyz](https://docs.base-standard.xyz)
- **Discord**: [discord.gg/base-standard](https://discord.gg/base-standard)

---

**API Version:** 2.0.0 (Recalibrated)

## Version Notes

### v2.0.0 (Recalibrated)
- Updated tier system to recalibrated thresholds (TOURIST, RESIDENT, BUILDER, BASED, LEGEND)
- Score range changed to 0-1000 scale
- Added three-pillar breakdown (Capital, Diversity, Identity)
- Added score decay mechanism
- Added Sybil resistance multiplier
