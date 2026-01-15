/**
 * Hook for Sign-In with Ethereum (SIWE) using NextAuth
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { signIn } from 'next-auth/react';
import { generateSIWEMessage } from '@/lib/identity/siwe';

/**
 * Hook to sign in with Ethereum wallet
 * Creates a SIWE message, signs it, and authenticates with NextAuth
 */
export function useSIWEAuth() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Step 1: Get nonce from NextAuth
      const nonceResponse = await fetch('/api/auth/csrf');
      const { csrfToken } = await nonceResponse.json();

      // Step 2: Generate SIWE message
      const domain = window.location.hostname;
      const uri = window.location.origin;
      const siweMessage = generateSIWEMessage({
        domain,
        address: address,
        statement: `Sign in to The Base Standard`,
        uri,
        version: '1',
        chainId: chainId || 8453,
        nonce: csrfToken,
        expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      });

      // Step 3: Sign message
      const signature = await signMessageAsync({
        message: siweMessage,
      });

      // Step 4: Sign in with NextAuth
      const result = await signIn('siwe', {
        message: siweMessage,
        signature: signature,
        address: address,
        nonce: csrfToken,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
  });
}
