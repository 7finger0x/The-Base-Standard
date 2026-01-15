'use client';

import React from 'react';
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  // Generate a cryptographically secure random string of the given length
  const generateSecureRandomString = (length: number): string => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.getRandomValues) {
      // Fallback to a non-cryptographic source only if crypto is unavailable
      return Math.random().toString(36).substring(2, 2 + length);
    }

    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    const randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);

    let result = '';
    for (let i = 0; i < length; i++) {
      // Map byte to index in alphabet to avoid bias
      result += alphabet[randomBytes[i] % alphabet.length];
    }
    return result;
  };

  // Generate a user ID (can be improved to use wallet address when connected)
  const getUserID = () => {
    if (typeof window !== 'undefined') {
      // Try to get existing user ID from localStorage
      let userID = localStorage.getItem('statsig_user_id');
      if (!userID) {
        // Generate a new user ID
        userID = `user_${Date.now()}_${generateSecureRandomString(7)}`;
        localStorage.setItem('statsig_user_id', userID);
      }
      return userID;
    }
    return 'anonymous';
  };

  const { client } = useClientAsyncInit(
    'client-5pOi9rqE3gOU5y2yoAECfE5n6mwUXzx6etiFupNTKsG',
    { userID: getUserID() },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    }
  );

  return (
    <StatsigProvider
      client={client}
      loadingComponent={null}
    >
      {children}
    </StatsigProvider>
  );
}
