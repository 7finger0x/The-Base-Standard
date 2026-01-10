"""
On-chain writer using CDP AgentKit
Handles autonomous contract interactions
"""

import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try to import CDP AgentKit
try:
    from coinbase_agentkit import AgentKit, CdpWalletProvider
    CDP_AVAILABLE = True
except ImportError:
    CDP_AVAILABLE = False
    logger.warning("CDP AgentKit not installed. Chain writes will be simulated.")

# Fallback to web3 for basic operations
try:
    from web3 import Web3
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False


# ReputationRegistry ABI (minimal for writes)
REGISTRY_ABI = [
    {
        "type": "function",
        "name": "updateScore",
        "inputs": [
            {"name": "user", "type": "address"},
            {"name": "score", "type": "uint256"}
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "batchUpdateScores",
        "inputs": [
            {"name": "users", "type": "address[]"},
            {"name": "scores", "type": "uint256[]"}
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
]


class ChainWriter:
    """
    Handles on-chain writes using CDP AgentKit
    Falls back to simulation mode if CDP not configured
    """

    def __init__(
        self,
        registry_address: str,
        rpc_url: str,
        chain_id: int = 8453
    ):
        self.registry_address = registry_address
        self.rpc_url = rpc_url
        self.chain_id = chain_id
        self.agent = None
        self.web3 = None

        self._init_agent()

    def _init_agent(self):
        """Initialize CDP AgentKit if credentials available"""
        if not CDP_AVAILABLE:
            logger.info("CDP AgentKit not available, running in simulation mode")
            return

        api_key_name = os.getenv("CDP_API_KEY_NAME")
        api_key_private = os.getenv("CDP_API_KEY_PRIVATE_KEY")

        if not api_key_name or not api_key_private:
            logger.info("CDP credentials not configured, running in simulation mode")
            return

        try:
            wallet_provider = CdpWalletProvider(
                api_key_name=api_key_name,
                api_key_private_key=api_key_private,
                network_id=f"base-{'mainnet' if self.chain_id == 8453 else 'sepolia'}"
            )
            self.agent = AgentKit(provider=wallet_provider)
            logger.info(f"CDP AgentKit initialized. Wallet: {self.agent.wallet_address}")
        except Exception as e:
            logger.error(f"Failed to initialize CDP AgentKit: {e}")

        # Also init web3 for reading
        if WEB3_AVAILABLE:
            self.web3 = Web3(Web3.HTTPProvider(self.rpc_url))

    @property
    def is_live(self) -> bool:
        """Check if we can make real transactions"""
        return self.agent is not None

    def update_score(self, user_address: str, score: int) -> Optional[str]:
        """
        Update a single user's score on-chain
        Returns transaction hash or None if simulated
        """
        if not self.is_live:
            logger.info(f"[SIMULATED] updateScore({user_address}, {score})")
            return None

        try:
            result = self.agent.invoke_contract(
                contract_address=self.registry_address,
                method="updateScore",
                abi=REGISTRY_ABI,
                args=[user_address, score]
            )
            tx_hash = result.get("transaction_hash")
            logger.info(f"Score updated for {user_address}: {score} (tx: {tx_hash})")
            return tx_hash
        except Exception as e:
            logger.error(f"Failed to update score for {user_address}: {e}")
            raise

    def batch_update_scores(self, updates: List[Dict[str, Any]]) -> Optional[str]:
        """
        Batch update multiple scores in one transaction
        Updates format: [{"address": "0x...", "score": 123}, ...]
        """
        if not updates:
            return None

        addresses = [u["address"] for u in updates]
        scores = [u["score"] for u in updates]

        if not self.is_live:
            logger.info(f"[SIMULATED] batchUpdateScores({len(updates)} accounts)")
            for u in updates[:5]:  # Log first 5
                logger.debug(f"  {u['address']}: {u['score']}")
            if len(updates) > 5:
                logger.debug(f"  ... and {len(updates) - 5} more")
            return "0x_simulated_tx_hash"

        try:
            result = self.agent.invoke_contract(
                contract_address=self.registry_address,
                method="batchUpdateScores",
                abi=REGISTRY_ABI,
                args=[addresses, scores]
            )
            tx_hash = result.get("transaction_hash")
            logger.info(f"Batch update complete for {len(updates)} accounts (tx: {tx_hash})")
            return tx_hash
        except Exception as e:
            logger.error(f"Batch update failed: {e}")
            raise

    def get_wallet_address(self) -> Optional[str]:
        """Get the agent's wallet address"""
        if self.agent:
            return self.agent.wallet_address
        return None

    def get_wallet_balance(self) -> Optional[float]:
        """Get the agent wallet's ETH balance"""
        if not self.web3 or not self.agent:
            return None

        try:
            balance_wei = self.web3.eth.get_balance(self.agent.wallet_address)
            return self.web3.from_wei(balance_wei, "ether")
        except Exception as e:
            logger.error(f"Failed to get balance: {e}")
            return None

    def estimate_gas(self, updates: List[Dict[str, Any]]) -> Optional[int]:
        """Estimate gas for a batch update"""
        if not self.web3:
            return None

        try:
            contract = self.web3.eth.contract(
                address=self.registry_address,
                abi=REGISTRY_ABI
            )
            addresses = [u["address"] for u in updates]
            scores = [u["score"] for u in updates]

            gas = contract.functions.batchUpdateScores(
                addresses, scores
            ).estimate_gas({"from": self.get_wallet_address()})

            return gas
        except Exception as e:
            logger.error(f"Gas estimation failed: {e}")
            return None
