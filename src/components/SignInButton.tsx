'use client';

import { useAccount } from 'wagmi';
import { useSession, signOut } from 'next-auth/react';
import { useSIWEAuth } from '@/hooks/useSIWEAuth';
import { cn } from '@/lib/utils';

/**
 * Sign-In Button Component
 *
 * Handles Sign-In with Ethereum (SIWE) authentication flow.
 * Shows different states:
 * - Not connected: Shows wallet connect button
 * - Connected but not signed in: Shows "Sign In with Ethereum" button
 * - Signed in: Shows session status and sign-out button
 */
export function SignInButton({ className }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const { mutate: signIn, isPending, isError, error } = useSIWEAuth();

  const isLoading = status === 'loading' || isPending;
  const isAuthenticated = !!session?.user;

  // If wallet not connected, return null (let OnchainKit handle it)
  if (!isConnected) {
    return null;
  }

  // If authenticated, show session status and sign-out
  if (isAuthenticated && session?.user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAddress = (session.user as any).address || address;
    return (
      <div className={cn('flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl', className)}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700">
            Signed In
          </span>
          {userAddress && (
            <span className="text-xs text-emerald-600 font-mono bg-emerald-100 px-2 py-0.5 rounded">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
          )}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-emerald-600">You can now link multiple wallets!</span>
        <button
          onClick={() => signOut({ redirect: false })}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Wallet connected but not signed in - show sign-in button prominently
  return (
    <div className={cn('p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl', className)}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Sign In to Link Multiple Wallets</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sign a message to verify ownership and combine reputation from all your wallets.
          </p>
        </div>
        <button
          onClick={() => signIn()}
          disabled={isLoading}
          className={cn(
            'px-6 py-3 rounded-xl font-semibold text-white transition-all whitespace-nowrap',
            'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
            'shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing In...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Sign In with Ethereum
            </>
          )}
        </button>
      </div>

      {isError && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error instanceof Error ? error.message : 'Sign-in failed. Please try again.'}
        </div>
      )}
    </div>
  );
}
