'use client';

import React from 'react';
import { useStatsigClient } from '@statsig/react-bindings';
import { useAccount } from 'wagmi';

/**
 * Example component showing how to log events with Statsig
 * 
 * This component demonstrates:
 * - Logging custom events
 * - Logging events with custom properties
 * - Using wallet address as user context
 */
export function StatsigExample() {
  const { client } = useStatsigClient();
  const { address, isConnected } = useAccount();

  const handleButtonClick = () => {
    // Log a simple event
    client.logEvent('button_clicked');

    // Log an event with custom properties (metadata must be string values)
    client.logEvent('wallet_interaction', undefined, {
      wallet_connected: String(isConnected),
      wallet_address: address || 'none',
      timestamp: new Date().toISOString(),
    });
  };

  const handleWalletConnect = () => {
    // Log wallet connection event
    if (address) {
      client.logEvent('wallet_connected', undefined, {
        address: address.toLowerCase(),
        chain: 'base',
      });
    }
  };

  // This would typically be called when wallet connects
  React.useEffect(() => {
    if (isConnected && address) {
      handleWalletConnect();
    }
  }, [isConnected, address]);

  return (
    <button
      onClick={handleButtonClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Click Me (Statsig Event)
    </button>
  );
}
