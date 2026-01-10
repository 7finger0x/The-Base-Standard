"""
Database interface for reading Ponder-indexed data
"""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)


class Database:
    """Interface to the Ponder Postgres database"""

    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, echo=False)
        self.Session = sessionmaker(bind=self.engine)
        logger.info("Database connection established")

    def get_accounts_needing_update(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get accounts that haven't been updated recently
        or have new activity since last update
        """
        query = text("""
            SELECT 
                a.id,
                a.base_score,
                a.zora_score,
                a.timely_score,
                a.total_score,
                a.tier,
                a.first_tx_timestamp,
                a.last_updated
            FROM account a
            WHERE a.last_updated < (EXTRACT(EPOCH FROM NOW()) - 3600)
               OR EXISTS (
                   SELECT 1 FROM zora_mint m 
                   WHERE m.minter = a.id 
                   AND m.minted_at > a.last_updated
               )
            ORDER BY a.last_updated ASC
            LIMIT :limit
        """)

        with self.Session() as session:
            result = session.execute(query, {"limit": limit})
            return [dict(row._mapping) for row in result]

    def get_account(self, address: str) -> Optional[Dict[str, Any]]:
        """Get a single account by address"""
        query = text("""
            SELECT 
                id,
                base_score,
                zora_score,
                timely_score,
                total_score,
                tier,
                first_tx_timestamp,
                last_updated
            FROM account
            WHERE id = :address
        """)

        with self.Session() as session:
            result = session.execute(query, {"address": address.lower()})
            row = result.fetchone()
            return dict(row._mapping) if row else None

    def get_mints_for_account(self, address: str) -> List[Dict[str, Any]]:
        """Get all mints for an account (including linked wallets)"""
        query = text("""
            SELECT 
                m.id,
                m.minter,
                m.contract_address,
                m.token_id,
                m.quantity,
                m.minted_at,
                m.network,
                m.is_early_mint,
                m.collection_deployed_at
            FROM zora_mint m
            WHERE m.minter = :address
               OR m.minter IN (
                   SELECT address FROM linked_wallet WHERE main_account_id = :address
               )
            ORDER BY m.minted_at DESC
        """)

        with self.Session() as session:
            result = session.execute(query, {"address": address.lower()})
            return [dict(row._mapping) for row in result]

    def get_linked_wallets(self, main_address: str) -> List[Dict[str, Any]]:
        """Get all wallets linked to a main account"""
        query = text("""
            SELECT 
                address,
                linked_at,
                zora_mint_count,
                early_mint_count,
                first_tx_timestamp
            FROM linked_wallet
            WHERE main_account_id = :address
        """)

        with self.Session() as session:
            result = session.execute(query, {"address": main_address.lower()})
            return [dict(row._mapping) for row in result]

    def mark_account_updated(self, address: str):
        """Mark an account as recently updated"""
        query = text("""
            UPDATE account 
            SET last_updated = EXTRACT(EPOCH FROM NOW())
            WHERE id = :address
        """)

        with self.Session() as session:
            session.execute(query, {"address": address.lower()})
            session.commit()

    def get_early_minters(self, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Find users who minted within N hours of collection deployment
        This is the core "Timeliness" logic
        """
        query = text("""
            SELECT 
                m.minter,
                COUNT(*) as early_mint_count,
                SUM(m.quantity) as total_early_quantity
            FROM zora_mint m
            WHERE m.is_early_mint = true
            GROUP BY m.minter
            HAVING COUNT(*) > 0
            ORDER BY COUNT(*) DESC
        """)

        with self.Session() as session:
            result = session.execute(query)
            return [dict(row._mapping) for row in result]

    def get_tier_distribution(self) -> Dict[str, int]:
        """Get count of accounts in each tier"""
        query = text("""
            SELECT tier, COUNT(*) as count
            FROM account
            GROUP BY tier
        """)

        with self.Session() as session:
            result = session.execute(query)
            return {row.tier: row.count for row in result}

    def get_top_accounts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get top accounts by score"""
        query = text("""
            SELECT 
                id,
                total_score,
                tier,
                base_score,
                zora_score,
                timely_score
            FROM account
            ORDER BY total_score DESC
            LIMIT :limit
        """)

        with self.Session() as session:
            result = session.execute(query, {"limit": limit})
            return [dict(row._mapping) for row in result]
