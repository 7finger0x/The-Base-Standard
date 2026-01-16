'use client';

import { useState } from 'react';
import { useIdentity, useUnlinkWallet, useSetPrimaryWallet } from '@/hooks/useIdentity';
import { LinkWalletModal } from '@/components/LinkWalletModal';
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
  const { data: identity, isLoading } = useIdentity();
  const { mutate: unlinkWallet, isPending: isUnlinking } = useUnlinkWallet();
  const { mutate: setPrimary, isPending: isSettingPrimary } = useSetPrimaryWallet();
  const [showLinkModal, setShowLinkModal] = useState(false);

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

  const wallets = identity?.wallets || [];

  return (
    <>
      <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
            Linked Wallets
          </h3>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold transition-colors"
          >
            + Link Wallet
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No wallets linked yet</p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Link Your First Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet: Wallet) => (
          <div
            key={wallet.id}
            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl transition-colors hover:border-gray-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                wallet.isPrimary 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gray-200'
              }`}>
                <span className="text-xs">💳</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                  {wallet.isPrimary && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      PRIMARY
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-gray-500">
                  {shortenAddress(wallet.address, 8)}
                </span>
                <div className="text-xs text-gray-500">
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
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
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
        )}
      </div>

      <LinkWalletModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        linkedWallets={wallets}
      />
    </>
  );
}
