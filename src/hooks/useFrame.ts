'use client';

import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/frame-sdk';

interface FrameContext {
  fid: number | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  isFrame: boolean;
  isReady: boolean;
}

export function useFrame() {
  const [context, setContext] = useState<FrameContext>({
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null,
    isFrame: false,
    isReady: false,
  });

  useEffect(() => {
    const initFrame = async () => {
      try {
        // Check if we're in a frame context
        const frameContext = await sdk.context;
        
        if (frameContext?.user) {
          setContext({
            fid: frameContext.user.fid,
            username: frameContext.user.username ?? null,
            displayName: frameContext.user.displayName ?? null,
            pfpUrl: frameContext.user.pfpUrl ?? null,
            isFrame: true,
            isReady: true,
          });

          // Signal that frame is ready
          sdk.actions.ready();
        } else {
          setContext(prev => ({ ...prev, isReady: true }));
        }
      } catch (error) {
        // Not in a frame context
        console.log('Not in frame context', error instanceof Error ? error.message : 'Unknown error');
        setContext(prev => ({ ...prev, isReady: true }));
      }
    };

    initFrame();
  }, []);

  const shareScore = useCallback(async (score: number, tier: string) => {
    if (!context.isFrame) return;

    try {
      await sdk.actions.composeCast({
        text: `My BaseRank Score: ${score} (${tier}) 🏆\n\nCheck your on-chain reputation:`,
        embeds: ['https://baserank.xyz'],
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [context.isFrame]);

  const openUrl = useCallback(async (url: string) => {
    if (context.isFrame) {
      await sdk.actions.openUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }, [context.isFrame]);

  return {
    ...context,
    shareScore,
    openUrl,
  };
}
