'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useSignMessage } from 'wagmi';
import { useSession } from 'next-auth/react';
import { generateSIWEMessage } from '@/lib/identity/siwe';
import type { Address } from 'viem';

export interface UserIdentity {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  score: number;
  tier: string;
  rank: number;
  primaryWallet?: {
    id: string;
    address: string;
    chainType: string;
    label?: string;
  };
  wallets: Array<{
    id: string;
    address: string;
    chainType: string;
    label?: string;
    isPrimary: boolean;
    verifiedAt: string;
  }>;
  socialAccounts: Array<{
    id: string;
    provider: string;
    providerUsername?: string;
    providerAvatar?: string;
  }>;
}

/**
 * Hook to get current user identity
 * Uses NextAuth session if available, otherwise falls back to wallet address
 */
export function useIdentity() {
  const { data: session } = useSession();
  const { address } = useAccount();

  // Use session userId if available, otherwise use wallet address
  const userId = session?.user?.id;
  const queryKey = userId ? ['identity', userId] : ['identity', address];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<UserIdentity> => {
      // Try session-based lookup first
      if (userId) {
        const response = await fetch('/api/identity/me');
        if (response.ok) {
          const data = await response.json();
          return data.data;
        }
      }

      // Fallback to address-based lookup
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch(`/api/identity/me?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch identity');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!(userId || address),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to link a new wallet using SIWE
 * Requires authentication via NextAuth session
 */
export function useLinkWallet() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { address: currentAddress, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async (newAddress: Address) => {
      if (!currentAddress) {
        throw new Error('No wallet connected');
      }

      // Check if authenticated
      if (!session?.user?.id) {
        throw new Error('Authentication required. Please sign in first.');
      }

      // Verify that the currently connected wallet matches the address we want to link
      // This ensures the signature will be valid
      if (currentAddress.toLowerCase() !== newAddress.toLowerCase()) {
        throw new Error(`Wallet mismatch. Please connect the wallet ${newAddress.slice(0, 6)}...${newAddress.slice(-4)} first.`);
      }

      // Step 1: Get nonce
      const nonceResponse = await fetch('/api/identity/nonce');
      const nonceData = await nonceResponse.json();
      const nonce = nonceData.data.nonce;

      // Step 2: Generate SIWE message for the currently connected wallet
      const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'base-standard.xyz';
      const uri = window.location.origin;
      const siweMessage = generateSIWEMessage({
        domain,
        address: currentAddress, // Use currentAddress to match the signing wallet
        statement: `Link wallet ${currentAddress} to your account`,
        uri,
        version: '1',
        chainId: chainId || 8453,
        nonce,
        expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      });

      // Step 3: Sign message with currently connected wallet
      const signature = await signMessageAsync({
        message: siweMessage,
      });

      // Step 4: Submit to backend (session cookie is automatically sent)
      // Use currentAddress (which matches newAddress after validation) to ensure consistency
      const response = await fetch('/api/identity/link-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          address: currentAddress, // Use currentAddress to match the signed message
          chainType: 'EVM',
          siweMessage,
          signature,
          nonce,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to link wallet');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity'] });
    },
  });
}

/**
 * Hook to unlink a wallet
 * Requires authentication via NextAuth session
 */
export function useUnlinkWallet() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (walletId: string) => {
      if (!session?.user?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/identity/wallets/${walletId}`, {
        method: 'DELETE',
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to unlink wallet');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity'] });
    },
  });
}

/**
 * Hook to set primary wallet
 * Requires authentication via NextAuth session
 */
export function useSetPrimaryWallet() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (walletId: string) => {
      if (!session?.user?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/identity/wallets/${walletId}/primary`, {
        method: 'PUT',
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to set primary wallet');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity'] });
    },
  });
}
