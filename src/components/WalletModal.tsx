'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { useSession } from 'next-auth/react';
import { useIdentity, useUnlinkWallet, useSetPrimaryWallet } from '@/hooks/useIdentity';
import { generateSIWEMessage } from '@/lib/identity/siwe';
import type { Address } from 'viem';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LinkingStep = 'idle' | 'connecting' | 'signing' | 'linking' | 'success' | 'error';

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { data: session } = useSession();
  const { data: identity, refetch: refetchIdentity } = useIdentity();
  const { mutate: unlinkWallet, isPending: isUnlinking } = useUnlinkWallet();
  const { mutate: setPrimary, isPending: isSettingPrimary } = useSetPrimaryWallet();

  const [activeTab, setActiveTab] = useState<'linked' | 'add'>('linked');
  const [linkingStep, setLinkingStep] = useState<LinkingStep>('idle');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pendingAddress, setPendingAddress] = useState<Address | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLinkingStep('idle');
      setLinkError(null);
      setPendingAddress(null);
    }
  }, [isOpen]);

  // When a new wallet connects, start the linking process
  useEffect(() => {
    if (pendingAddress && address && address.toLowerCase() === pendingAddress.toLowerCase() && linkingStep === 'connecting') {
      handleSignAndLink(address);
    }
  }, [address, pendingAddress, linkingStep]);

  const linkedWallets = identity?.wallets || [];
  const isAuthenticated = !!session?.user?.id;

  const handleConnectAndLink = async (connector: typeof connectors[0]) => {
    setLinkError(null);
    setLinkingStep('connecting');

    try {
      // Connect the wallet
      connect({ connector }, {
        onSuccess: (data) => {
          const newAddress = data.accounts[0] as Address;
          setPendingAddress(newAddress);
          // The useEffect will pick up the new address and continue
        },
        onError: (error) => {
          setLinkError(error.message);
          setLinkingStep('error');
        }
      });
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'Failed to connect wallet');
      setLinkingStep('error');
    }
  };

  const handleSignAndLink = async (walletAddress: Address) => {
    setLinkingStep('signing');
    setLinkError(null);

    try {
      // Check if already linked
      const alreadyLinked = linkedWallets.some(
        w => w.address.toLowerCase() === walletAddress.toLowerCase()
      );
      if (alreadyLinked) {
        setLinkError('This wallet is already linked to your account');
        setLinkingStep('error');
        return;
      }

      // Step 1: Get nonce
      const nonceResponse = await fetch('/api/identity/nonce');
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }
      const nonceData = await nonceResponse.json();
      const nonce = nonceData.data?.nonce || nonceData.nonce;

      // Step 2: Generate SIWE message
      const domain = window.location.host;
      const uri = window.location.origin;
      const siweMessage = generateSIWEMessage({
        domain,
        address: walletAddress,
        statement: `Link wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} to your Base Standard account`,
        uri,
        version: '1',
        chainId: chainId || 8453,
        nonce,
        expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

      // Step 3: Sign message
      const signature = await signMessageAsync({
        message: siweMessage,
      });

      setLinkingStep('linking');

      // Step 4: Submit to backend
      const response = await fetch('/api/identity/link-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          address: walletAddress,
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

      setLinkingStep('success');
      setPendingAddress(null);

      // Refresh identity data
      await refetchIdentity();

      // Reset after showing success
      setTimeout(() => {
        setLinkingStep('idle');
        setActiveTab('linked');
      }, 2000);

    } catch (error) {
      console.error('Link wallet error:', error);
      setLinkError(error instanceof Error ? error.message : 'Failed to link wallet');
      setLinkingStep('error');
    }
  };

  const handleLinkCurrentWallet = () => {
    if (address) {
      handleSignAndLink(address);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Auth Warning */}
        {!isAuthenticated && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Sign in required</p>
                <p className="text-xs text-amber-600 mt-1">
                  Click &quot;Sign In with Ethereum&quot; on the main page first to link multiple wallets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('linked')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'linked'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Linked Wallets ({linkedWallets.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Link New Wallet
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'linked' ? (
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
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">Currently Connected</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!linkedWallets.some(w => w.address.toLowerCase() === address.toLowerCase()) && isAuthenticated && (
                        <button
                          onClick={handleLinkCurrentWallet}
                          disabled={linkingStep !== 'idle'}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Link This Wallet
                        </button>
                      )}
                      <button
                        onClick={() => disconnect()}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked wallets */}
              {linkedWallets.length > 0 ? (
                linkedWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
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
                            {wallet.address.toLowerCase() === address?.toLowerCase() && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{wallet.chainType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!wallet.isPrimary && (
                          <>
                            <button
                              onClick={() => setPrimary(wallet.id)}
                              disabled={isSettingPrimary}
                              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                            >
                              Set Primary
                            </button>
                            <button
                              onClick={() => unlinkWallet(wallet.id)}
                              disabled={isUnlinking}
                              className="px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-sm">No wallets linked yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isAuthenticated
                      ? 'Go to "Link New Wallet" to add wallets'
                      : 'Sign in first to link wallets'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Linking Progress */}
              {linkingStep !== 'idle' && linkingStep !== 'error' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {linkingStep === 'success' ? (
                      <span className="text-green-500 text-xl">✓</span>
                    ) : (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        {linkingStep === 'connecting' && 'Connecting wallet...'}
                        {linkingStep === 'signing' && 'Please sign the message in your wallet...'}
                        {linkingStep === 'linking' && 'Linking wallet to your account...'}
                        {linkingStep === 'success' && 'Wallet linked successfully!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {linkError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">✕</span>
                    <div>
                      <p className="text-sm font-medium text-red-800">Error linking wallet</p>
                      <p className="text-xs text-red-600 mt-1">{linkError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLinkError(null);
                      setLinkingStep('idle');
                    }}
                    className="mt-3 w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Instructions */}
              {linkingStep === 'idle' && !linkError && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">How to link a wallet:</h4>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Click a wallet provider below</li>
                      <li>Connect the wallet you want to link</li>
                      <li>Sign a message to verify ownership</li>
                      <li>Your wallets&apos; scores will be combined!</li>
                    </ol>
                  </div>

                  {/* Wallet Connectors */}
                  <div className="space-y-2">
                    {connectors.map((connector) => (
                      <button
                        key={connector.uid}
                        onClick={() => handleConnectAndLink(connector)}
                        disabled={!isAuthenticated || isConnecting}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                          {connector.name.includes('MetaMask') && '🦊'}
                          {connector.name.includes('Coinbase') && '🔵'}
                          {connector.name.includes('WalletConnect') && '🔗'}
                          {!connector.name.includes('MetaMask') && !connector.name.includes('Coinbase') && !connector.name.includes('WalletConnect') && '💳'}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{connector.name}</div>
                          <div className="text-xs text-gray-500">
                            {!isAuthenticated ? 'Sign in first' : 'Click to connect & link'}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Why link multiple wallets?</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <strong>Combine reputation</strong> from all your addresses</li>
                      <li>• <strong>Higher score</strong> = better tier & benefits</li>
                      <li>• <strong>Prove ownership</strong> across different chains</li>
                    </ul>
                  </div>
                </>
              )}
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
