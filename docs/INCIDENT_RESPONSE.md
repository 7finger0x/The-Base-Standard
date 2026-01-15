# Incident Response Plan

**Last Updated:** January 10, 2026  
**Version:** 1.0.0

## Overview

This document outlines procedures for responding to production incidents affecting The Base Standard.

## Incident Severity Levels

### P0 - Critical (Immediate Response)
- Application completely down
- Data loss occurring
- Security breach detected
- Smart contract exploit
- **Response Time:** < 15 minutes
- **Resolution Target:** < 1 hour

### P1 - High (Same Day)
- Major feature broken
- Performance severely degraded (>5s response times)
- Affecting >10% of users
- Database connection failures
- **Response Time:** < 1 hour
- **Resolution Target:** < 4 hours

### P2 - Medium (This Week)
- Minor feature broken
- Workaround available
- Affecting <10% of users
- Degraded service (Ponder down)
- **Response Time:** < 4 hours
- **Resolution Target:** < 24 hours

### P3 - Low (Backlog)
- Visual bugs
- Enhancement requests
- Performance degradation <10%
- **Response Time:** Next business day
- **Resolution Target:** Next sprint

## Incident Response Workflow

### 1. Detection
- Automated alerts (Sentry, Vercel, UptimeRobot)
- User reports
- Team member discovery
- Health check failures

### 2. Triage
1. **Acknowledge** incident in team channel
2. **Assess** severity level
3. **Assign** incident owner
4. **Create** incident ticket/document

### 3. Investigation
1. Check health endpoint: `/api/health`
2. Review error logs in Vercel dashboard
3. Check database status
4. Verify RPC endpoint availability
5. Review recent deployments

### 4. Resolution
1. Implement fix or workaround
2. Deploy fix to production
3. Verify resolution
4. Monitor for 30 minutes

### 5. Post-Mortem
1. Document root cause
2. Identify prevention measures
3. Update runbooks
4. Share learnings with team

## Common Incident Scenarios

### Database Connection Failure

**Symptoms:**
- 503 errors on API endpoints
- Health check shows database as unhealthy
- Error logs show connection timeouts

**Response:**
1. Check database provider status page
2. Verify DATABASE_URL is correct
3. Check connection pool limits
4. Restart application if needed
5. Scale database if capacity issue

**Prevention:**
- Connection pooling configured
- Database monitoring alerts
- Regular capacity planning

### High Error Rate

**Symptoms:**
- Error rate > 5%
- Multiple 5xx responses
- User reports of failures

**Response:**
1. Check error logs for patterns
2. Identify failing endpoint
3. Check for recent code changes
4. Rollback if recent deployment
5. Implement fix

**Prevention:**
- Comprehensive testing
- Staged rollouts
- Canary deployments

### Rate Limiting Issues

**Symptoms:**
- Legitimate users getting 429 errors
- Rate limit headers incorrect
- In-memory rate limiter reset

**Response:**
1. Check rate limit configuration
2. Verify Redis connection (if using)
3. Adjust rate limits if needed
4. Clear rate limit cache if corrupted

**Prevention:**
- Redis-based rate limiting
- Proper rate limit headers
- Monitoring rate limit violations

### Smart Contract Interaction Failures

**Symptoms:**
- Wallet linking fails
- Score updates not working
- Contract calls timing out

**Response:**
1. Verify contract address is correct
2. Check Base network status
3. Verify RPC endpoint is responsive
4. Check wallet has sufficient gas
5. Verify contract is not paused

**Prevention:**
- Contract monitoring
- RPC endpoint redundancy
- Gas price monitoring

### DDoS Attack

**Symptoms:**
- Sudden traffic spike
- Response times increasing
- Rate limits maxing out
- Legitimate users affected

**Response:**
1. Enable Vercel DDoS protection
2. Tighten rate limits temporarily
3. Block malicious IP ranges
4. Contact Vercel support
5. Consider Cloudflare in front

**Prevention:**
- Rate limiting configured
- DDoS protection enabled
- Traffic monitoring
- IP reputation checks

## Communication Plan

### Internal Communication
- **Slack Channel:** #incidents
- **Status Page:** Update during incidents
- **Team Notifications:** PagerDuty/Opsgenie

### External Communication
- **Status Page:** status.base-standard.xyz
- **Twitter:** @BaseStandard (if applicable)
- **Discord:** Announcement channel

### Communication Template
```
[INCIDENT] [SEVERITY] [TITLE]

Status: Investigating / Identified / Monitoring / Resolved
Impact: [Description of impact]
ETA: [Expected resolution time]

Updates:
- [Time] [Update message]
```

## Escalation Path

1. **On-Call Engineer** (First responder)
2. **Tech Lead** (If unresolved in 30 min)
3. **CTO/Founder** (If P0 and unresolved in 1 hour)

## Post-Incident Review

### Within 24 Hours
- [ ] Incident summary written
- [ ] Root cause identified
- [ ] Impact assessment completed

### Within 1 Week
- [ ] Post-mortem meeting scheduled
- [ ] Action items created
- [ ] Prevention measures implemented

### Post-Mortem Template
```markdown
# Incident: [Title]
**Date:** [Date]
**Severity:** P0/P1/P2/P3
**Duration:** [Start] to [End]

## Summary
[Brief description]

## Timeline
- [Time] - Incident detected
- [Time] - Investigation started
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Incident resolved

## Root Cause
[Detailed analysis]

## Impact
- Users affected: [Number]
- Downtime: [Duration]
- Data loss: [Yes/No]

## Resolution
[Steps taken to resolve]

## Action Items
- [ ] [Action item 1]
- [ ] [Action item 2]

## Prevention
[Measures to prevent recurrence]
```

## Tools & Resources

### Monitoring
- Vercel Analytics
- Sentry (Error tracking)
- UptimeRobot (Uptime monitoring)
- Custom health checks

### Communication
- Slack (#incidents channel)
- PagerDuty (On-call)
- Status page

### Documentation
- Deployment runbook
- Architecture diagrams
- Database schemas
- API documentation

## Related Documentation

- [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)
- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md)
