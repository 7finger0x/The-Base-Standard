'use client';

import { useAccount } from 'wagmi';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Identity,
  Name,
  Avatar,
  Address,
} from '@coinbase/onchainkit/identity';
import { RankCard } from '@/components/RankCard';
import { WalletList } from '@/components/WalletList';
import { TierBadge } from '@/components/TierBadge';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black">
      {/* Circuit Pattern Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-bg" patternUnits="userSpaceOnUse" width="40" height="40">
              <path
                d="M0 20h40M20 0v40"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className="text-cyan-500"
              />
              <circle cx="20" cy="20" r="2" fill="currentColor" className="text-purple-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-bg)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">BR</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gradient">
                BaseRank
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol</p>
            </div>
          </div>

          {/* Wallet */}
          <Wallet>
            <ConnectWallet className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-all">
              <Avatar className="h-5 w-5" />
              <Name className="ml-2" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar className="h-10 w-10" />
                <Name className="font-semibold" />
                <Address className="text-zinc-400" />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {!isConnected ? (
          /* Not Connected State */
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            {/* Hero */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-1 animate-pulse-glow">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-5xl font-black text-gradient">BR</span>
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gradient">
              What Is Your Base Rank?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Connect your wallet to discover your on-chain reputation score across Base and Zora.
            </p>

            <Wallet>
              <ConnectWallet className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                Check My Score
              </ConnectWallet>
            </Wallet>

            {/* Tier Preview */}
            <div className="mt-16 w-full max-w-3xl">
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-6">Reputation Tiers</p>
              <div className="grid grid-cols-5 gap-3">
                <TierBadge tier="Novice" mini />
                <TierBadge tier="Bronze" mini />
                <TierBadge tier="Silver" mini />
                <TierBadge tier="Gold" mini />
                <TierBadge tier="BASED" mini />
              </div>
            </div>

            {/* Data Sources */}
            <div className="mt-16 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">B</span>
                </div>
                <p className="text-zinc-400 text-sm">Base Tenure</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">Z</span>
                </div>
                <p className="text-zinc-400 text-sm">Zora Mints</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-600/20 flex items-center justify-center">
                  <span className="text-violet-400 font-bold">F</span>
                </div>
                <p className="text-zinc-400 text-sm">Farcaster</p>
              </div>
            </div>
          </div>
        ) : (
          /* Connected State */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Card */}
            <RankCard />

            {/* Score Breakdown */}
            <ScoreBreakdown />

            {/* Linked Wallets */}
            <div className="lg:col-span-2">
              <WalletList />
            </div>

            {/* All Tiers */}
            <div className="lg:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wider mb-4">
                All Tiers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <TierBadge tier="Novice" score={50} />
                <TierBadge tier="Bronze" score={250} />
                <TierBadge tier="Silver" score={650} />
                <TierBadge tier="Gold" score={900} />
                <TierBadge tier="BASED" score={1000} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-zinc-500">
          <p>© 2025 BaseRank Protocol</p>
          <div className="flex items-center gap-4">
            <span>Built on Base + Zora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
