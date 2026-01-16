'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useLinkWallet, useIdentity } from '@/hooks/useIdentity';
import { shortenAddress } from '@/lib/utils';
import type { Address } from 'viem';

type Wallet = {
  id: string;
  address: string;
  chainType: string;
  label?: string;
  isPrimary: boolean;
  verifiedAt: string;
};

interface LinkWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedWallets: Wallet[];
}

export function LinkWalletModal({ isOpen, onClose, linkedWallets }: LinkWalletModalProps) {
  const { data: session } = useSession();
  const { address: currentAddress, isConnected, connector } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { mutate: linkWallet, isPending: isLinking } = useLinkWallet();
  const { refetch: refetchIdentity } = useIdentity();
  const [activeTab, setActiveTab] = useState<'linked' | 'link'>('link');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthenticated = !!session?.user?.id;
  const linkedAddresses = linkedWallets.map(w => w.address.toLowerCase());

  // Watch for wallet connection changes and clear errors
  useEffect(() => {
    if (isConnected && currentAddress) {
      setError(null);
      // If wallet is already linked, show message
      if (linkedAddresses.includes(currentAddress.toLowerCase())) {
        setError(null); // Clear error, the UI will show "Already Linked"
      }
    }
  }, [isConnected, currentAddress, linkedAddresses]);

  if (!isOpen) return null;

  const handleConnectWallet = async (connectorId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in first');
      return;
    }

    try {
      setError(null);
      const targetConnector = connectors.find(c => c.id === connectorId);
      if (!targetConnector) {
        setError('Wallet connector not found');
        return;
      }

      // If already connected to this connector, check if it's already linked
      if (isConnected && connector?.id === connectorId && currentAddress) {
        if (linkedAddresses.includes(currentAddress.toLowerCase())) {
          setError('This wallet is already linked');
          return;
        }
        // If connected but not linked, allow linking
        return;
      }

      // If connected to a different wallet, disconnect first
      if (isConnected && connector?.id !== connectorId) {
        disconnect();
        // Wait a bit for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Connect to the new wallet
      connect({ 
        connector: targetConnector,
        onSuccess: () => {
          setError(null);
          // Connection successful, user can now link
        },
        onError: (err) => {
          setError(err?.message || 'Failed to connect wallet. Please try again.');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleLinkCurrentWallet = async () => {
    if (!currentAddress) {
      setError('No wallet connected');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in first');
      return;
    }

    // Check if wallet is already linked
    if (linkedAddresses.includes(currentAddress.toLowerCase())) {
      setError('This wallet is already linked');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      linkWallet(currentAddress as Address, {
        onSuccess: async () => {
          setError(null);
          setSuccessMessage('Wallet linked successfully!');
          // Refresh identity to get updated wallet list
          await refetchIdentity();
          // Switch to linked wallets tab to show the new wallet
          setTimeout(() => {
            setActiveTab('linked');
            setSuccessMessage(null);
          }, 2000);
        },
        onError: (err: Error) => {
          setError(err.message || 'Failed to link wallet');
          setSuccessMessage(null);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link wallet');
      setSuccessMessage(null);
    }
  };

  const getWalletConnector = (walletName: string) => {
    if (walletName.toLowerCase().includes('coinbase')) {
      return connectors.find(c => 
        c.id === 'coinbaseWalletSDK' || 
        c.name.toLowerCase().includes('coinbase')
      );
    }
    if (walletName.toLowerCase().includes('metamask')) {
      return connectors.find(c => 
        c.id === 'injected' || 
        c.name.toLowerCase().includes('metamask') ||
        (c.type === 'injected' && typeof window !== 'undefined' && window.ethereum?.isMetaMask)
      );
    }
    return null;
  };

  const coinbaseConnector = connectors.find(c => 
    c.id === 'coinbaseWalletSDK' || 
    c.name.toLowerCase().includes('coinbase')
  );
  
  const metamaskConnector = connectors.find(c => {
    if (c.id === 'injected' || c.type === 'injected') {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ethereum = (window as any).ethereum;
        return ethereum?.isMetaMask || c.name.toLowerCase().includes('metamask');
      }
    }
    return false;
  });

  const isCurrentWalletLinked = currentAddress && linkedAddresses.includes(currentAddress.toLowerCase());

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-2xl font-bold text-gray-900">Manage Wallets</h4>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning if not authenticated */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Sign in required. Click 'Sign In with Ethereum' on the main page first to link multiple wallets.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('linked')}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === 'linked'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Linked Wallets ({linkedWallets.length})
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === 'link'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Link New Wallet
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'linked' ? (
          <div className="space-y-3">
            {linkedWallets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No wallets linked yet</p>
            ) : (
              linkedWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      wallet.isPrimary 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gray-200'
                    }`}>
                      <span className="text-sm">💳</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {shortenAddress(wallet.address, 8)}
                        </span>
                        {wallet.isPrimary && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Added {new Date(wallet.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Steps */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-medium text-gray-700">Steps to link a wallet:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Connect your wallet using one of the options below</li>
                <li>Sign a message to verify ownership</li>
                <li>Your wallets' scores will be combined!</li>
              </ol>
            </div>

            {/* Wallet Options */}
            <div className="space-y-3">
              {/* Coinbase Wallet */}
              <button
                onClick={() => coinbaseConnector && handleConnectWallet(coinbaseConnector.id)}
                disabled={!isAuthenticated || isConnecting || isLinking || !coinbaseConnector}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  !isAuthenticated || !coinbaseConnector
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#0052FF"/>
                      <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Coinbase Wallet</div>
                    <div className="text-sm text-gray-500">
                      {!isAuthenticated ? 'Sign in first' : 'Click to connect'}
                    </div>
                  </div>
                </div>
              </button>

              {/* MetaMask */}
              <button
                onClick={() => metamaskConnector && handleConnectWallet(metamaskConnector.id)}
                disabled={!isAuthenticated || isConnecting || isLinking || !metamaskConnector}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  !isAuthenticated || !metamaskConnector
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F6851B"/>
                      <path d="M2 17L12 22L22 17" stroke="#F6851B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="#F6851B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">MetaMask</div>
                    <div className="text-sm text-gray-500">
                      {!isAuthenticated ? 'Sign in first' : 'Click to connect'}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Current Wallet Status */}
            {isConnected && currentAddress && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Connected Wallet</p>
                    <p className="text-xs text-gray-600 font-mono mt-1">{shortenAddress(currentAddress, 12)}</p>
                  </div>
                  {isCurrentWalletLinked && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                      Already Linked
                    </span>
                  )}
                </div>
                {!isCurrentWalletLinked && (
                  <>
                    <button
                      onClick={handleLinkCurrentWallet}
                      disabled={isLinking || !isAuthenticated || isConnecting}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLinking ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Linking...
                        </span>
                      ) : (
                        'Link This Wallet'
                      )}
                    </button>
                    {!isAuthenticated && (
                      <p className="mt-2 text-xs text-center text-gray-600">
                        Sign in first to link this wallet
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Connection Status */}
            {isConnecting && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600">
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting wallet...
                </span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-gray-900 mb-2">Why link multiple wallets?</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Combine reputation from all your addresses</li>
                <li>• Higher score = better tier & benefits</li>
                <li>• Prove ownership across different chains</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
