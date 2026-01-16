'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { TierCard } from './TierCard';
import { cn } from '@/lib/utils';

interface TierCardMinterProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'BASED';
  score: string;
  descriptor: string;
  mintPrice?: string;
  userScore?: number;
  className?: string;
}

// Mock contract address - replace with actual deployed contract
const TIER_NFT_CONTRACT = '0x0000000000000000000000000000000000000000' as `0x${string}`;

// Simple ABI for minting - replace with actual contract ABI
const TIER_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'tierId', type: 'uint256' }],
    outputs: [],
  },
] as const;

const TIER_IDS = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  BASED: 4,
};

export function TierCardMinter({
  tier,
  score,
  descriptor,
  mintPrice = '0.001',
  userScore,
  className,
}: TierCardMinterProps) {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const { writeContract, data: hash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user is eligible to mint this tier
  const isEligible = () => {
    if (!userScore) return false;

    const scoreNum = parseInt(score.split('-')[0]);
    return userScore >= scoreNum;
  };

  const handleMint = async () => {
    if (!isConnected || !address) return;

    try {
      setIsMinting(true);

      writeContract({
        address: TIER_NFT_CONTRACT,
        abi: TIER_NFT_ABI,
        functionName: 'mint',
        args: [BigInt(TIER_IDS[tier])],
        value: BigInt(Math.floor(parseFloat(mintPrice) * 1e18)),
      });
    } catch (err) {
      console.error('Minting error:', err);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Tier Card Display */}
      <TierCard tier={tier} score={score} descriptor={descriptor} />

      {/* Minting Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Mint Price</div>
            <div className="text-2xl font-bold text-white">{mintPrice} ETH</div>
          </div>

          {userScore !== undefined && (
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Your Score</div>
              <div className={cn(
                'text-2xl font-bold',
                isEligible() ? 'text-green-400' : 'text-red-400'
              )}>
                {userScore}
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-400 text-sm font-semibold">
              NFT Minted Successfully! 🎉
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-sm">
              Error: {error.message}
            </div>
          </div>
        )}

        {/* Eligibility Warning */}
        {userScore !== undefined && !isEligible() && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-yellow-400 text-sm">
              Your reputation score is not high enough to mint this tier NFT.
              Keep building your reputation to unlock it!
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <ConnectWallet className="w-full" />
        ) : (
          <button
            onClick={handleMint}
            disabled={isMinting || isConfirming || !isEligible() || isSuccess}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-bold text-white transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isEligible() && !isSuccess
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                : 'bg-gray-700'
            )}
          >
            {isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⌛</span>
                Confirming...
              </span>
            ) : isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⌛</span>
                Minting...
              </span>
            ) : isSuccess ? (
              '✓ Minted'
            ) : !isEligible() ? (
              'Not Eligible'
            ) : (
              'Mint NFT'
            )}
          </button>
        )}

        {/* Info Text */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          This NFT represents your achievement of reaching the {tier} tier
          in The Base Standard reputation system.
        </div>
      </div>
    </div>
  );
}
