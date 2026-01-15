'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';

export function ShareButton() {
  const { address } = useAccount();
  const { data: reputation } = useReputation(address);
  const [copied, setCopied] = useState(false);

  if (!reputation) return null;

  const shareUrl = 'https://base-standard.xyz';
  const shareText = `I just checked my onchain reputation on The Base Standard! 🔵\n\nScore: ${reputation.totalScore}/1000\nTier: ${reputation.tier}\n\nCheck yours here:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      
      <a
        href={warpcastUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path d="M23.2 12.04c0 6.16-5.04 11.16-11.16 11.16S.88 18.2.88 12.04 5.92.88 12.04.88 23.2 5.92 23.2 12.04zM12.04 2.64c-5.2 0-9.4 4.2-9.4 9.4s4.2 9.4 9.4 9.4 9.4-4.2 9.4-9.4-4.2-9.4-9.4-9.4zm-2.32 12.64c.64 0 1.16-.52 1.16-1.16s-.52-1.16-1.16-1.16-1.16.52-1.16 1.16.52 1.16 1.16 1.16zm4.64 0c.64 0 1.16-.52 1.16-1.16s-.52-1.16-1.16-1.16-1.16.52-1.16 1.16.52 1.16 1.16 1.16z" />
        </svg>
        Warpcast
      </a>

      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors text-sm flex items-center gap-2"
      >
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}