# Session Management Implementation Plan

**Date**: 2025-01-10  
**Status**: Planning  
**Priority**: High

## Overview

The Base Standard currently uses placeholder `'current-user-id'` headers for user authentication. This document outlines the plan to implement proper session management using JWT tokens and cookies.

## Current State

### Issues
- `src/app/api/identity/link-wallet/route.ts` - Uses placeholder `'current-user-id'` header
- `src/app/api/identity/me/route.ts` - Uses placeholder `'current-user-id'` header
- `src/hooks/useIdentity.ts` - Sends `'current-user-id'` in headers (3 instances)
- No session validation
- No token expiration
- No secure cookie handling

### Impact
- User identity cannot be properly tracked
- Multi-wallet linking cannot be secured
- No protection against session hijacking
- Cannot verify user ownership of resources

## Proposed Solution

### Option 1: NextAuth.js (Recommended)
**Pros:**
- Industry standard for Next.js
- Built-in session management
- Supports multiple providers (including SIWE)
- Automatic cookie handling
- Secure by default

**Cons:**
- Adds dependency
- May require database adapter

**Implementation Time**: 4-6 hours

### Option 2: Custom JWT Implementation
**Pros:**
- Full control over session logic
- Lightweight
- No additional dependencies (besides `jose` or `jsonwebtoken`)

**Cons:**
- More code to maintain
- Need to implement refresh tokens manually
- More security considerations

**Implementation Time**: 6-8 hours

## Recommended Approach: NextAuth.js with SIWE Provider

### Architecture

```
User connects wallet → Sign SIWE message → NextAuth creates session
  ↓
Session stored in HTTP-only cookie
  ↓
API routes extract userId from session token
  ↓
Identity operations use verified userId
```

### Implementation Steps

1. **Install Dependencies**
   ```bash
   npm install next-auth@beta @auth/prisma-adapter
   ```

2. **Create NextAuth Configuration**
   - File: `src/lib/auth.ts`
   - Configure SIWE provider
   - Set up Prisma adapter
   - Configure session strategy

3. **Update API Routes**
   - Replace `request.headers.get('x-user-id')` with `await getServerSession()`
   - Extract `userId` from session

4. **Update Hooks**
   - Remove hardcoded `'current-user-id'` headers
   - Use NextAuth session hooks (`useSession`)

5. **Add Session Middleware**
   - Protect identity routes with session check
   - Redirect unauthenticated users

### Files to Modify

1. `src/lib/auth.ts` (NEW)
   - NextAuth configuration
   - SIWE provider setup

2. `src/app/api/auth/[...nextauth]/route.ts` (NEW)
   - NextAuth API route handler

3. `src/app/api/identity/link-wallet/route.ts`
   - Replace: `request.headers.get('x-user-id')`
   - With: `await getServerSession()`

4. `src/app/api/identity/me/route.ts`
   - Replace: `request.headers.get('x-user-id')`
   - With: `await getServerSession()`

5. `src/app/api/identity/wallets/[walletId]/route.ts`
   - Replace: `request.headers.get('x-user-id')`
   - With: `await getServerSession()`

6. `src/app/api/identity/wallets/[walletId]/primary/route.ts`
   - Replace: `request.headers.get('x-user-id')`
   - With: `await getServerSession()`

7. `src/hooks/useIdentity.ts`
   - Remove: `'x-user-id': 'current-user-id'` (3 instances)
   - Use: `useSession()` from NextAuth

### Security Considerations

1. **HTTP-Only Cookies**
   - Session tokens stored in HTTP-only cookies
   - Prevents XSS attacks

2. **Secure Cookies**
   - `Secure` flag in production (HTTPS only)
   - `SameSite=Strict` to prevent CSRF

3. **Token Expiration**
   - Access tokens: 15 minutes
   - Refresh tokens: 7 days

4. **Session Validation**
   - Validate session on every request
   - Check token expiration
   - Verify user still exists

## Migration Plan

### Phase 1: Setup (1 hour)
1. Install NextAuth.js
2. Create NextAuth configuration
3. Set up API route

### Phase 2: Update Identity Routes (2 hours)
1. Update all identity API routes
2. Add session validation helpers
3. Update error handling

### Phase 3: Update Frontend (1-2 hours)
1. Add NextAuth session provider
2. Update hooks to use `useSession`
3. Update components that check auth state

### Phase 4: Testing (1 hour)
1. Test wallet linking flow
2. Test session persistence
3. Test session expiration
4. Test unauthorized access

### Phase 5: Cleanup (30 minutes)
1. Remove placeholder code
2. Update documentation
3. Remove TODO comments

## Testing Checklist

- [ ] User can create session by connecting wallet
- [ ] Session persists across page refreshes
- [ ] Session expires after configured time
- [ ] Unauthenticated users cannot access identity routes
- [ ] User can link wallets when authenticated
- [ ] User can unlink wallets when authenticated
- [ ] User can set primary wallet when authenticated
- [ ] User cannot modify other users' identities
- [ ] Session is invalidated on logout
- [ ] CSRF protection works correctly

## Rollback Plan

If issues arise:
1. Keep placeholder `'current-user-id'` as fallback
2. Add feature flag: `ENABLE_SESSION_MANAGEMENT`
3. Gradually enable for testing users
4. Monitor error logs

## Success Criteria

- ✅ All identity routes use session-based auth
- ✅ No placeholder `'current-user-id'` in codebase
- ✅ All tests pass
- ✅ Session tokens stored securely
- ✅ Unauthorized access properly blocked
- ✅ Documentation updated

## Next Steps

1. Review and approve this plan
2. Install NextAuth.js dependencies
3. Begin Phase 1 implementation
4. Test incrementally
5. Deploy to staging for testing

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [SIWE Provider](https://next-auth.js.org/providers/sign-in-with-ethereum)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Session Management Best Practices](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/README)
