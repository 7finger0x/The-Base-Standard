/**
 * NextAuth.js v5 Configuration
 * 
 * Provides session management with Sign-In with Ethereum (SIWE)
 * and Prisma adapter for database-backed sessions
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import { verifyMessage } from 'viem';
import type { Address } from 'viem';
import { RequestLogger } from './request-logger';

/**
 * Sign-In with Ethereum (SIWE) credentials provider
 * Validates wallet signatures for authentication
 */
const siweProvider = CredentialsProvider({
  id: 'siwe',
  name: 'Sign-In with Ethereum',
  credentials: {
    message: { label: 'Message', type: 'text' },
    signature: { label: 'Signature', type: 'text' },
    address: { label: 'Address', type: 'text' },
    nonce: { label: 'Nonce', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.message || !credentials?.signature || !credentials?.address) {
      return null;
    }

    try {
      const message = typeof credentials.message === 'string' ? credentials.message : '';
      const signature = typeof credentials.signature === 'string' ? credentials.signature : '';
      const address = typeof credentials.address === 'string' ? credentials.address : '';

      // Verify the signature
      const isValid = await verifyMessage({
        address: address as Address,
        message: message as string,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        return null;
      }

      // Parse SIWE message to extract nonce and domain
      // Basic validation - in production, use proper SIWE parser
      const messageLines = message.split('\n');
      const addressMatch = messageLines[0]?.match(/with your Ethereum account:\n(.+?)$/m);
      
      if (!addressMatch || addressMatch[1].trim().toLowerCase() !== address.toLowerCase()) {
        return null;
      }

      // Find or create user from wallet address
      const { IdentityService } = await import('./identity/identity-service');
      const { user } = await IdentityService.createOrGetUserFromWallet(
        address as Address
      );

      return {
        id: user.id,
        address: address,
        name: user.displayName || user.username || null,
        email: null,
        image: user.avatarUrl || null,
      };
    } catch (error) {
      RequestLogger.logError('SIWE authorization error', error, {
        operation: 'authorize',
        provider: 'siwe',
      });
      return null;
    }
  },
});

/**
 * NextAuth configuration (v5)
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [siweProvider],
  session: {
    strategy: 'jwt', // Use JWT for better performance, can switch to database later
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;
        token.address = account?.address || user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_URL || 'change-me-in-production',
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Export auth function for server-side usage
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
