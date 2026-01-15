'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useIdentity, useUnlinkWallet, useSetPrimaryWallet } from '@/hooks/useIdentity';
import { useNameResolution } from '@/hooks/useNameResolution';
import { shortenAddress } from '@/lib/utils';

type Wallet = {
  id: string;
  address: string;
  chainType: string;
  label?: string;
  isPrimary: boolean;
  verifiedAt: string;
};

export function WalletList() {
  const { address } = useAccount();
  const { data: identity, isLoading } = useIdentity();
  const { mutate: unlinkWallet, isPending: isUnlinking } = useUnlinkWallet();
  const { mutate: setPrimary, isPending: isSettingPrimary } = useSetPrimaryWallet();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { baseName: primaryBaseName } = useNameResolution();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-32 bg-zinc-800 rounded" />
          <div className="h-20 bg-zinc-900/50 rounded-xl border border-zinc-800" />
          <div className="h-20 bg-zinc-900/50 rounded-xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!identity?.wallets?.length) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wider">
          Linked Wallets
        </h3>
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition-colors"
        >
          + Link Wallet
        </button>
      </div>

      <div className="space-y-3">
        {identity.wallets.map((wallet: Wallet) => (
          <div
            key={wallet.id}
            className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                wallet.isPrimary 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-zinc-800'
              }`}>
                <span className="text-xs">💳</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                  {wallet.isPrimary && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      PRIMARY
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  {shortenAddress(wallet.address, 8)}
                </span>
                <div className="text-xs text-zinc-500">
                  Added {new Date(wallet.verifiedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!wallet.isPrimary && (
                <>
                  <button
                    onClick={() => setPrimary(wallet.id)}
                    disabled={isSettingPrimary}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Make Primary
                  </button>
                  <button
                    onClick={() => unlinkWallet(wallet.id)}
                    disabled={isUnlinking}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Unlink
                  </button>
                </>
              )}
              <button 
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded"
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

      {/* Link Modal - Placeholder for now */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold">Link Wallet</h4>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-zinc-400">Wallet linking modal coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
