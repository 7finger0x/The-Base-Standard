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
import { Sidebar } from '@/components/Sidebar';
import { MetricCard, BaseTenureGraphic, ZoraMintsGraphic, ReputationScoreGraphic, EarlyAdopterGraphic } from '@/components/MetricCard';
import { RankCard } from '@/components/RankCard';
import { WalletList } from '@/components/WalletList';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { SignInButton } from '@/components/SignInButton';

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        {!isConnected ? (
          /* Not Connected State - Landing Page */
          <>
            {/* Status Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Base L2</span>
            </div>

            {/* Hero Section */}
            <section className="relative px-12 py-20">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hero-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const x = (i % 5) * 20;
                        const y = Math.floor(i / 5) * 20;
                        const length = 10 + Math.random() * 40;
                        const opacity = 0.1 + Math.random() * 0.3;
                        return (
                          <line
                            key={i}
                            x1={x}
                            y1={y}
                            x2={x + length}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity={opacity}
                            className="text-gray-400"
                          />
                        );
                      })}
                      {Array.from({ length: 20 }).map((_, i) => {
                        const x = (i % 5) * 20;
                        const y = Math.floor(i / 5) * 20;
                        const length = 10 + Math.random() * 40;
                        const opacity = 0.1 + Math.random() * 0.3;
                        return (
                          <line
                            key={`v-${i}`}
                            x1={x}
                            y1={y}
                            x2={x}
                            y2={y + length}
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity={opacity}
                            className="text-gray-400"
                          />
                        );
                      })}
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-pattern)" />
                </svg>
              </div>

              <div className="relative max-w-4xl">
                <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
                  A verifiable reputation system, built by all of us
                </h1>
              </div>
            </section>

            {/* Secondary Section */}
            <section className="px-12 py-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
                  {/* Left: Headline */}
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                      An open standard for on-chain reputation
                    </h2>
                  </div>

                  {/* Right: Description */}
                  <div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      The Base Standard is built to empower builders, creators, and people everywhere
                      to establish verifiable on-chain reputation, earn their tier, mint achievement
                      cards, and prove their commitment to the Base ecosystem.
                    </p>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="BASE TENURE"
                    description="Days since your first transaction on Base L2. Every day counts toward your reputation."
                    graphic={<BaseTenureGraphic />}
                  />
                  <MetricCard
                    title="ZORA MINTS"
                    description="NFTs minted on Zora. Early adopters get bonus points for minting within 24 hours."
                    graphic={<ZoraMintsGraphic />}
                  />
                  <MetricCard
                    title="REPUTATION SCORE"
                    description="Your aggregated score across all metrics. Earn your tier and unlock exclusive benefits."
                    graphic={<ReputationScoreGraphic />}
                  />
                  <MetricCard
                    title="EARLY ADOPTER"
                    description="Bonus multipliers for being among the first to engage with new collections and protocols."
                    graphic={<EarlyAdopterGraphic />}
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Connected State - Dashboard */
          <div className="px-12 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900">Your Reputation</h1>
                <Wallet>
                  <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
                    <Avatar className="h-5 w-5" />
                    <Name className="ml-2" />
                  </ConnectWallet>
                  <WalletDropdown>
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                      <Avatar className="h-10 w-10" />
                      <Name className="font-semibold" />
                      <Address className="text-gray-400" />
                    </Identity>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                </Wallet>
              </div>

              <SignInButton />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <RankCard />
                <ScoreBreakdown />
              </div>

              <div className="mt-6">
                <WalletList />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
