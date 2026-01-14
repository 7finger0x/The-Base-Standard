// src/hooks/useLinkWallet.ts
import { useState } from 'react';
import { useWriteContract, useSignTypedData } from 'wagmi';
import { reputationRegistryConfig } from '../config/contracts';
import { type Address, type Hex } from 'viem';

// The EIP-712 Domain Separator
const domain = {
  name: 'The Base Standard',
  version: '1',
  chainId: reputationRegistryConfig.chainId,
  verifyingContract: reputationRegistryConfig.address,
} as const;

// The Type Definition for the signature
const types = {
  LinkWallet: [
    { name: 'main', type: 'address' },
    { name: 'secondary', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export function useLinkWallet() {
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync, isPending, error } = useWriteContract();
  
  // State to hold the signature between wallet switches
  const [signature, setSignature] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<bigint>(BigInt(0));

  /**
   * STEP 1: Connect SECONDARY wallet and call this.
   * Generates the cryptographic proof that allows linking.
   */
  const signLink = async (mainWallet: Address, secondaryWallet: Address, nonce: bigint) => {
    // 1 hour deadline
    const newDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    
    try {
      const sig = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'LinkWallet',
        message: {
          main: mainWallet,
          secondary: secondaryWallet,
          nonce: nonce, 
          deadline: newDeadline,
        },
      });
      
      setSignature(sig);
      setDeadline(newDeadline);
      return { signature: sig, deadline: newDeadline };
    } catch (err) {
      console.error("Error signing link:", err);
      throw err;
    }
  };

  /**
   * STEP 2: Connect MAIN wallet and call this.
   * Submits the proof to the blockchain.
   */
  const executeLink = async (secondaryWallet: Address) => {
    if (!signature) throw new Error("No signature found. Sign with secondary wallet first.");

    return writeContractAsync({
      ...reputationRegistryConfig,
      functionName: 'linkWallet',
      args: [secondaryWallet, deadline, signature as Hex],
    });
  };

  return { 
    signLink, 
    executeLink, 
    storedSignature: signature,
    isLoading: isPending,
    error 
  };
}