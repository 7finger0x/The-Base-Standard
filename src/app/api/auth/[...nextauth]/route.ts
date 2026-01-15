/**
 * NextAuth.js v5 API Route Handler
 * 
 * Handles authentication requests (sign in, sign out, session)
 * Route: /api/auth/[...nextauth]
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
