'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useIdentity } from '@/hooks/useIdentity';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: identity } = useIdentity();
  const [activeTab, setActiveTab] = useState<'connected' | 'add'>('connected');

  if (!isOpen) return null;

  const linkedWallets = identity?.wallets || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Manage Wallets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('connected')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'connected'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connected Wallets ({linkedWallets.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Wallet
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'connected' ? (
            <div className="space-y-3">
              {/* Current connected wallet */}
              {isConnected && address && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm">🔗</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">Currently Connected</div>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}

              {/* Linked wallets from identity */}
              {linkedWallets.length > 0 ? (
                linkedWallets.map((wallet: { id: string; address: string; isPrimary: boolean; chainType: string }) => (
                  <div
                    key={wallet.id}
                    className={`p-4 rounded-xl border ${
                      wallet.address.toLowerCase() === address?.toLowerCase()
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          wallet.isPrimary
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gray-200'
                        }`}>
                          <span className="text-sm">{wallet.isPrimary ? '⭐' : '💳'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 font-mono">
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </span>
                            {wallet.isPrimary && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700 rounded-full">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{wallet.chainType}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-sm">No wallets linked yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add a wallet to aggregate your reputation</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Connect additional wallets to aggregate your on-chain reputation across multiple addresses.
              </p>

              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {connector.name === 'MetaMask' && '🦊'}
                    {connector.name === 'Coinbase Wallet' && '🔵'}
                    {connector.name === 'WalletConnect' && '🔗'}
                    {!['MetaMask', 'Coinbase Wallet', 'WalletConnect'].includes(connector.name) && '💳'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{connector.name}</div>
                    <div className="text-xs text-gray-500">
                      {isPending ? 'Connecting...' : 'Click to connect'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Why link multiple wallets?</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Combine reputation from all your addresses</li>
                  <li>• Higher aggregated score = better tier</li>
                  <li>• Prove ownership across different chains</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
