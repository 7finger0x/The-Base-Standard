'use client';

import { useFrame } from '@/hooks/useFrame';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  score: number;
  tier: string;
  className?: string;
}

export function ShareButton({ score, tier, className }: ShareButtonProps) {
  const { isFrame, shareScore } = useFrame();

  const handleShare = async () => {
    if (isFrame) {
      await shareScore(score, tier);
    } else {
      // Web share fallback
      const text = `My The Base Standard Score: ${score} (${tier}) 🏆\n\nCheck your on-chain reputation: https://baserank.xyz`;
      
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-purple-600 hover:bg-purple-500 text-white font-semibold',
        'transition-colors',
        className
      )}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </button>
  );
}
