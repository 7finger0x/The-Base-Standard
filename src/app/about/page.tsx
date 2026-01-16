'use client';

import { Sidebar } from '@/components/Sidebar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Base L2</span>
        </div>

        {/* Content */}
        <div className="px-12 py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black text-gray-900 mb-8">About The Base Standard</h1>

            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Base Standard is an open protocol for verifiable on-chain reputation. We believe that your
                  contributions to the blockchain ecosystem should be recognized, rewarded, and portable across platforms.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">1. Connect Your Wallet</h3>
                    <p className="text-gray-600">
                      Link your Ethereum wallet to start building your reputation profile. We analyze your on-chain
                      activity across Base and other supported networks.
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">2. Build Your Score</h3>
                    <p className="text-gray-600">
                      Your reputation score is calculated from multiple metrics including tenure, transaction activity,
                      NFT mints, and early adoption bonuses.
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">3. Earn Your Tier</h3>
                    <p className="text-gray-600">
                      As your score grows, you advance through tiers from Tourist to Legend. Each tier unlocks new
                      benefits and recognition in the ecosystem.
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">4. Prove Your Reputation</h3>
                    <p className="text-gray-600">
                      Use your verified reputation across protocols, DAOs, and applications. Your on-chain history
                      becomes a portable credential.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Built on Base</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Base Standard is built on Base, Coinbase&apos;s Ethereum L2. Base provides fast, low-cost
                  transactions while maintaining the security of Ethereum. Our smart contracts are fully audited
                  and open source.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Community</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The Base Standard is community-driven. Join us to help shape the future of on-chain reputation.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Twitter
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
