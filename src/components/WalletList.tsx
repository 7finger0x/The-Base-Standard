'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useReputation } from '@/hooks/useReputation';
import { useLinkWallet } from '@/hooks/useLinkWallet';
import { useNameResolution } from '@/hooks/useNameResolution';
import { cn, shortenAddress, formatAddressWithNames } from '@/lib/utils';
import { base, baseSepolia } from 'wagmi/chains';

export function WalletList() {
  const { address } = useAccount();
  const { data: reputation } = useReputation(address);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const { baseName: primaryBaseName, resolveName: resolvePrimaryName } = useNameResolution();
  
  const linkedWallets = reputation?.linkedWallets ?? [];
  const linkedWalletsKey = linkedWallets.join(',');

  // Resolve names for all wallets
  useEffect(() => {
    const resolveAllNames = async () => {
      if (address) {
        resolvePrimaryName(address);
      }
      
      // Resolve names for linked wallets
      const namePromises = linkedWallets.map(async (wallet) => {
        try {
          const name = await formatAddressWithNames(wallet);
          return { wallet, name };
        } catch {
          return { wallet, name: shortenAddress(wallet, 6) };
        }
      });
      
      const results = await Promise.all(namePromises);
      const nameMap = Object.fromEntries(results.map(({ wallet, name }) => [wallet, name]));
      setResolvedNames(nameMap);
    };
    
    resolveAllNames();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, linkedWalletsKey, resolvePrimaryName]);

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

      {linkedWallets.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <p>No linked wallets yet.</p>
          <p className="text-sm mt-1">Link additional wallets to aggregate your score.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {linkedWallets.map((wallet) => (
            <li
              key={wallet}
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-100">
                    {resolvedNames[wallet] || shortenAddress(wallet, 6)}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    {shortenAddress(wallet, 8)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded-full">
                  Linked
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(wallet)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Primary Wallet */}
      {address && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-100">
                    {primaryBaseName ? `${primaryBaseName}.base.eth` : 'Primary Wallet' }
                  </span>
                  <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                    PRIMARY
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  {shortenAddress(address, 8)}
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(address)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded"
              title="Copy address"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkWalletModal 
          onClose={() => setShowLinkModal(false)} 
          primaryBaseName={primaryBaseName}
        />
      )}
    </div>
  );
}

function LinkWalletModal({ onClose, primaryBaseName }: { onClose: () => void; primaryBaseName?: string | null }) {
  // Helper function for step progression
  const stepOrder: Array<'input' | 'validate' | 'sign' | 'execute' | 'success'> = ['input', 'validate', 'sign', 'execute', 'success'];
  
  const [secondaryAddress, setSecondaryAddress] = useState('');
  const { signLink, executeLink, isLoading } = useLinkWallet();
  const { address: mainAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'input' | 'validate' | 'sign' | 'execute' | 'success'>('input');
  const [error, setError] = useState<string | null>(null);
  
  const { baseName: secondaryBaseName, resolveName: resolveSecondaryName } = useNameResolution();

  const stepIndex = stepOrder.indexOf(step);
  const getIndex = (stepName: typeof step) => stepOrder.indexOf(stepName);

  // Auto-resolve name when address changes
  useEffect(() => {
    if (secondaryAddress && secondaryAddress.startsWith('0x') && secondaryAddress.length === 42) {
      resolveSecondaryName(secondaryAddress);
    }
  }, [secondaryAddress, resolveSecondaryName]);

  const validateAddress = (address: string): boolean => {
    return address.startsWith('0x') && address.length === 42 && address !== mainAddress;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSecondaryAddress(value);
    setError(null);
    
    // Auto-validate
    if (value && !validateAddress(value)) {
      setError('Please enter a valid Ethereum address (0x...)');
    } else if (value === mainAddress) {
      setError('Cannot link the same wallet');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateAddress(secondaryAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (!mainAddress) {
      setError('Main wallet not connected');
      return;
    }

    setStep('validate');
    
    try {
      // Ensure we're on the correct chain
      if (walletClient?.chain.id !== base.id && walletClient?.chain.id !== baseSepolia.id) {
        await switchChain({ chainId: base.id });
      }

      setStep('sign');
      
      // Step 1: Sign with secondary wallet
      await signLink(
        mainAddress,
        secondaryAddress as `0x${string}`,
        BigInt(0)
      );
      
      setStep('execute');
      
      // Step 2: Execute with main wallet
      await executeLink(secondaryAddress as `0x${string}`);
      
      setStep('success');
      
      // Optimistic update
      queryClient.setQueryData(['reputation'], (old: Record<string, unknown> | undefined) => ({
        ...old,
        linkedWallets: [...((old?.linkedWallets as string[]) ?? []), secondaryAddress],
      }));
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: unknown) {
      // Rollback on failure
      queryClient.invalidateQueries({ queryKey: ['reputation'] });
      console.error('Failed to link wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to link wallet';
      setError(errorMessage);
      setStep('input');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold">Link Wallet</h4>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            disabled={step === 'sign' || step === 'execute'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {[
              { step: 'input', label: 'Enter Address' },
              { step: 'validate', label: 'Validate' },
              { step: 'sign', label: 'Sign Message' },
              { step: 'execute', label: 'Confirm Link' },
              { step: 'success', label: 'Complete' }
            ].map(({ step: stepKey, label }, index) => {
              const typedStepKey = stepKey as typeof step;
              return (
              <div key={stepKey} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-2 ${
                  step === typedStepKey 
                    ? 'bg-cyan-500 text-white' 
                    : stepIndex > getIndex(typedStepKey)
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-700 text-zinc-500'
                }`}>
                  {stepIndex > getIndex(typedStepKey) ? '✓' : index + 1}
                </div>
                <span className={`text-xs text-center ${
                  step === typedStepKey ? 'text-cyan-400' : 
                  stepIndex > getIndex(typedStepKey) ? 'text-green-400' : 'text-zinc-600'
                }`}>
                  {label}
                </span>
              </div>
              );
            })}
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${(stepIndex / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 'input' && (
            <>
              <label className="block text-sm text-zinc-400 mb-2">Secondary Wallet Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0x... or vitalik.base.eth"
                  value={secondaryAddress}
                  onChange={handleAddressChange}
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-800 border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-colors ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-cyan-500'
                  }`}
                />
                {secondaryBaseName && (
                  <div className="mt-2 text-sm text-cyan-400">
                    Resolved: {secondaryBaseName}.base.eth
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Enter a wallet address or Base Name to link
              </p>
            </>
          )}
          
          {step === 'validate' && (
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <h5 className="font-semibold text-yellow-400 mb-1">Validating...</h5>
              <p className="text-sm text-zinc-300">Checking wallet compatibility</p>
            </div>
          )}
          
          {step === 'sign' && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
                <h5 className="font-semibold text-blue-400">Action Required</h5>
              </div>
              <p className="text-sm text-zinc-300 mb-3">
                Switch to your secondary wallet and sign the linking message.
              </p>
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Secondary Wallet:</div>
                <div className="font-mono text-sm text-zinc-200">
                  {secondaryBaseName ? `${secondaryBaseName}.base.eth` : shortenAddress(secondaryAddress, 8)}
                </div>
              </div>
            </div>
          )}
          
          {step === 'execute' && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full"></div>
                <h5 className="font-semibold text-green-400">Almost Done!</h5>
              </div>
              <p className="text-sm text-zinc-300 mb-3">
                Switch back to your main wallet to confirm the link.
              </p>
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Main Wallet:</div>
                <div className="font-mono text-sm text-zinc-200">
                  {primaryBaseName ? `${primaryBaseName}.base.eth` : shortenAddress(mainAddress || '', 8)}
                </div>
              </div>
            </div>
          )}
          
          {step === 'success' && (
            <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/50 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h5 className="font-semibold text-green-400 mb-1">Wallet Linked Successfully!</h5>
              <p className="text-sm text-zinc-300">Closing in 2 seconds...</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || step !== 'input'}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg font-semibold transition-colors',
                'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
                (isLoading || step !== 'input') && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Linking...' : step === 'sign' ? 'Switch to Secondary Wallet & Sign' : step === 'execute' ? 'Switch Back to Main Wallet & Confirm' : 'Link Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
