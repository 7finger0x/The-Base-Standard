'use client';

import { Box, Link2, Globe, Shield } from 'lucide-react';

interface Phase {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const phases: Phase[] = [
  {
    number: 1,
    title: 'FOUNDATION',
    description: 'Establish core reputation metrics.',
    icon: <Box className="w-8 h-8" />,
  },
  {
    number: 2,
    title: 'INTEGRATION',
    description: 'Connect with major wallets.',
    icon: <Link2 className="w-8 h-8" />,
  },
  {
    number: 3,
    title: 'EXPANSION',
    description: 'Broaden adoption across platforms.',
    icon: <Globe className="w-8 h-8" />,
  },
  {
    number: 4,
    title: 'ECOSYSTEM',
    description: 'Cultivate a trusted decentralized network.',
    icon: <Shield className="w-8 h-8" />,
  },
];

export function RoadmapSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Project Roadmap
          </h2>
          <p className="text-zinc-400 text-lg">Building the future of on-chain reputation</p>
        </div>

        <div className="relative rounded-2xl border-2 border-gradient-to-r from-purple-500 to-blue-500 bg-gradient-to-br from-purple-950/30 to-blue-950/30 p-8 backdrop-blur-sm">
          {/* Circuit board pattern */}
          <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="roadmap-circuit" patternUnits="userSpaceOnUse" width="40" height="40">
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
              <rect width="100%" height="100%" fill="url(#roadmap-circuit)" />
            </svg>
          </div>

          <div className="relative">
            <h3 className="text-2xl font-black text-white mb-8 text-center uppercase">
              PROJECT ROADMAP: THE BASE STANDARD
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 relative">
              {phases.map((phase, index) => (
                <div key={phase.number} className="flex-1 flex flex-col items-center relative">
                  {/* Hexagon */}
                  <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-28 h-28 border-2 border-purple-500/50 bg-black/50 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="text-blue-400 mb-2">{phase.icon}</div>
                        <div className="text-xs font-bold text-white/60 uppercase tracking-wider text-center px-2">
                          PHASE {phase.number}: {phase.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white text-sm text-center max-w-[200px]">
                    {phase.description}
                  </p>

                  {/* Arrow connector (except last) */}
                  {index < phases.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-16 text-blue-400 text-2xl font-bold">
                      &gt;&gt;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
