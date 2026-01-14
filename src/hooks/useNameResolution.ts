'use client';

import { useState } from 'react';
import { resolveBaseName, reverseResolveBaseName } from '@/lib/utils';

export function useNameResolution() {
  const [baseName, setBaseName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolveName = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const name = await resolveBaseName(address);
      setBaseName(name);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to resolve name'));
      setBaseName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseResolve = async (name: string) => {
    if (!name) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await reverseResolveBaseName(name);
      // We could store the address if needed
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reverse resolve'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    baseName,
    isLoading,
    error,
    resolveName,
    reverseResolve
  };
}