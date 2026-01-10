"""
BaseRank Protocol - AI Agent
Autonomous score calculation and on-chain updates using CDP AgentKit
"""

import os
import time
import logging
import schedule
from dotenv import load_dotenv

from database import Database
from score_calculator import ScoreCalculator
from chain_writer import ChainWriter

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


class BaseRankAgent:
    """
    Main agent class that orchestrates:
    1. Reading from Ponder database
    2. Calculating timeliness scores
    3. Writing updates to chain via CDP wallet
    """

    def __init__(self):
        self.db = Database(os.getenv("DATABASE_URL"))
        self.calculator = ScoreCalculator()
        self.writer = ChainWriter(
            registry_address=os.getenv("REGISTRY_ADDRESS"),
            rpc_url=os.getenv("RPC_URL"),
            chain_id=int(os.getenv("CHAIN_ID", "8453"))
        )
        self.batch_size = int(os.getenv("BATCH_SIZE", "50"))
        self.badge_threshold = int(os.getenv("SCORE_THRESHOLD_FOR_BADGE", "1000"))

    def run_cycle(self):
        """Execute one full agent cycle"""
        logger.info("Starting agent cycle...")

        try:
            # 1. Get accounts that need score updates
            accounts = self.db.get_accounts_needing_update(limit=self.batch_size)
            logger.info(f"Found {len(accounts)} accounts to process")

            if not accounts:
                logger.info("No accounts need updates")
                return

            # 2. Calculate scores for each account
            updates = []
            for account in accounts:
                try:
                    new_score = self.calculator.calculate_total_score(
                        account_id=account["id"],
                        mints=self.db.get_mints_for_account(account["id"]),
                        first_tx_timestamp=account.get("first_tx_timestamp"),
                        linked_wallets=self.db.get_linked_wallets(account["id"])
                    )

                    if new_score != account.get("total_score", 0):
                        updates.append({
                            "address": account["id"],
                            "score": new_score
                        })
                        logger.debug(f"Score change for {account['id']}: {account.get('total_score', 0)} -> {new_score}")

                except Exception as e:
                    logger.error(f"Error calculating score for {account['id']}: {e}")

            if not updates:
                logger.info("No score changes detected")
                return

            logger.info(f"Preparing to update {len(updates)} scores on-chain")

            # 3. Batch update scores on-chain
            try:
                tx_hash = self.writer.batch_update_scores(updates)
                logger.info(f"Batch update submitted: {tx_hash}")

                # 4. Mark accounts as updated in DB
                for update in updates:
                    self.db.mark_account_updated(update["address"])

            except Exception as e:
                logger.error(f"Chain write failed: {e}")

            # 5. Check for badge eligibility
            self._check_badge_eligibility(updates)

        except Exception as e:
            logger.error(f"Agent cycle failed: {e}")

    def _check_badge_eligibility(self, updates: list):
        """Check if any accounts crossed the badge threshold"""
        for update in updates:
            if update["score"] >= self.badge_threshold:
                account = self.db.get_account(update["address"])
                if account and not account.get("badge_minted"):
                    logger.info(f"Account {update['address']} eligible for BASED badge!")
                    # TODO: Mint soulbound badge
                    # self.writer.mint_badge(update["address"])


def main():
    """Main entry point"""
    logger.info("=" * 50)
    logger.info("BaseRank Agent Starting")
    logger.info("=" * 50)

    agent = BaseRankAgent()

    # Run immediately on start
    agent.run_cycle()

    # Schedule periodic runs
    interval = int(os.getenv("AGENT_INTERVAL_MINUTES", "60"))
    schedule.every(interval).minutes.do(agent.run_cycle)

    logger.info(f"Scheduled to run every {interval} minutes")

    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
