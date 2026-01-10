"""
Score calculation logic for BaseRank Protocol
"""

import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class ScoreCalculator:
    """
    Calculates reputation scores based on:
    1. Base Tenure - Days since first transaction on Base
    2. Zora Mints - Number of NFTs minted
    3. Timeliness - Bonus for early mints (< 24h from collection deploy)
    """

    # Score multipliers
    BASE_TENURE_POINTS_PER_DAY = 1
    ZORA_MINT_POINTS = 10
    EARLY_MINT_BONUS = 100
    EARLY_MINT_WINDOW_SECONDS = 24 * 60 * 60  # 24 hours

    # Tier thresholds
    TIER_THRESHOLDS = {
        "BASED": 1000,
        "Gold": 850,
        "Silver": 500,
        "Bronze": 100,
        "Novice": 0,
    }

    def calculate_total_score(
        self,
        account_id: str,
        mints: List[Dict[str, Any]],
        first_tx_timestamp: Optional[int] = None,
        linked_wallets: Optional[List[Dict[str, Any]]] = None
    ) -> int:
        """
        Calculate the total reputation score for an account
        """
        base_score = self._calculate_base_tenure(first_tx_timestamp)
        zora_score = self._calculate_zora_score(mints)
        timely_score = self._calculate_timeliness_score(mints)

        # Include linked wallet scores
        if linked_wallets:
            for wallet in linked_wallets:
                if wallet.get("first_tx_timestamp"):
                    base_score += self._calculate_base_tenure(wallet["first_tx_timestamp"])
                zora_score += wallet.get("zora_mint_count", 0) * self.ZORA_MINT_POINTS
                timely_score += wallet.get("early_mint_count", 0) * self.EARLY_MINT_BONUS

        total = base_score + zora_score + timely_score

        logger.debug(
            f"Score for {account_id}: base={base_score}, zora={zora_score}, "
            f"timely={timely_score}, total={total}"
        )

        return total

    def _calculate_base_tenure(self, first_tx_timestamp: Optional[int]) -> int:
        """
        Calculate Base tenure score
        1 point per day since first transaction
        """
        if not first_tx_timestamp:
            return 0

        current_time = int(time.time())
        seconds_since_first = current_time - first_tx_timestamp
        days = seconds_since_first // 86400  # seconds per day

        return max(0, days * self.BASE_TENURE_POINTS_PER_DAY)

    def _calculate_zora_score(self, mints: List[Dict[str, Any]]) -> int:
        """
        Calculate Zora minting score
        10 points per mint
        """
        total_quantity = sum(mint.get("quantity", 1) for mint in mints)
        return total_quantity * self.ZORA_MINT_POINTS

    def _calculate_timeliness_score(self, mints: List[Dict[str, Any]]) -> int:
        """
        Calculate timeliness bonus
        100 points per early mint (within 24h of collection deploy)
        """
        early_mints = 0

        for mint in mints:
            if mint.get("is_early_mint"):
                early_mints += mint.get("quantity", 1)
            elif self._is_early_mint(mint):
                early_mints += mint.get("quantity", 1)

        return early_mints * self.EARLY_MINT_BONUS

    def _is_early_mint(self, mint: Dict[str, Any]) -> bool:
        """
        Check if a mint occurred within 24 hours of collection deployment
        """
        minted_at = mint.get("minted_at")
        deployed_at = mint.get("collection_deployed_at")

        if not minted_at or not deployed_at:
            return False

        time_diff = minted_at - deployed_at
        return 0 <= time_diff < self.EARLY_MINT_WINDOW_SECONDS

    def get_tier(self, score: int) -> str:
        """
        Get tier name from score
        """
        for tier, threshold in sorted(
            self.TIER_THRESHOLDS.items(),
            key=lambda x: x[1],
            reverse=True
        ):
            if score >= threshold:
                return tier
        return "Novice"

    def calculate_score_breakdown(
        self,
        account_id: str,
        mints: List[Dict[str, Any]],
        first_tx_timestamp: Optional[int] = None,
        linked_wallets: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Get detailed score breakdown
        """
        base_score = self._calculate_base_tenure(first_tx_timestamp)
        zora_score = self._calculate_zora_score(mints)
        timely_score = self._calculate_timeliness_score(mints)

        # Count stats
        total_mints = sum(m.get("quantity", 1) for m in mints)
        early_mints = sum(
            m.get("quantity", 1) for m in mints 
            if m.get("is_early_mint") or self._is_early_mint(m)
        )

        # Tenure days
        tenure_days = 0
        if first_tx_timestamp:
            tenure_days = (int(time.time()) - first_tx_timestamp) // 86400

        total_score = base_score + zora_score + timely_score

        return {
            "total_score": total_score,
            "tier": self.get_tier(total_score),
            "breakdown": {
                "base_tenure": {
                    "score": base_score,
                    "days": tenure_days,
                },
                "zora_mints": {
                    "score": zora_score,
                    "count": total_mints,
                    "early_mints": early_mints,
                },
                "timeliness": {
                    "score": timely_score,
                    "early_adopter_count": early_mints,
                },
            },
        }
