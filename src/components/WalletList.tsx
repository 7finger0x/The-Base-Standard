'use client';

import { useIdentity } from '@/hooks/useIdentity';

type Wallet = {
  id: string;
  address: string;
  chainType: string;
  label?: string;
  isPrimary: boolean;
  verifiedAt: string;
};

export function WalletList() {
  const { data: identity, isLoading } = useIdentity();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-50 rounded-xl border border-gray-200" />
          <div className="h-20 bg-gray-50 rounded-xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!identity?.wallets?.length) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
          Connected Wallet
        </h3>
      </div>

      <div className="space-y-3">
        {identity.wallets.map((wallet: Wallet) => (
          <div
            key={wallet.id}
            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl transition-colors hover:border-gray-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xs">💳</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                    BASE SMART WALLET
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Connected {new Date(wallet.verifiedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                title="Copy address"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
