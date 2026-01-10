"""
Tests for Database interface
"""

import pytest
from unittest.mock import Mock, MagicMock, patch, call
from sqlalchemy import text
from database import Database


@pytest.fixture
def mock_engine():
    return Mock()


@pytest.fixture
def mock_session():
    session = MagicMock()
    return session


@pytest.fixture
def db(mock_engine):
    with patch('database.create_engine', return_value=mock_engine):
        with patch('database.sessionmaker'):
            db = Database("postgresql://test:test@localhost/test")
            return db


class TestDatabaseInit:
    """Tests for database initialization"""

    def test_database_init_creates_engine(self):
        with patch('database.create_engine') as mock_create:
            with patch('database.sessionmaker'):
                Database("postgresql://test:test@localhost/test")
                mock_create.assert_called_once()

    def test_database_init_creates_sessionmaker(self):
        with patch('database.create_engine', return_value=Mock()):
            with patch('database.sessionmaker') as mock_sessionmaker:
                Database("postgresql://test:test@localhost/test")
                mock_sessionmaker.assert_called_once()


class TestGetAccountsNeedingUpdate:
    """Tests for get_accounts_needing_update"""

    def test_returns_list_of_accounts(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "id": "0x123",
            "base_score": 100,
            "zora_score": 200,
            "timely_score": 300,
            "total_score": 600,
            "tier": "Silver",
            "first_tx_timestamp": 1000,
            "last_updated": 2000,
        }
        mock_result.__iter__ = Mock(return_value=iter([mock_row]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        accounts = db.get_accounts_needing_update(limit=10)

        assert len(accounts) == 1
        assert accounts[0]["id"] == "0x123"
        assert accounts[0]["total_score"] == 600

    def test_uses_correct_limit(self, db, mock_session):
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        db.get_accounts_needing_update(limit=25)

        call_args = mock_session.execute.call_args
        assert call_args[0][1]["limit"] == 25


class TestGetAccount:
    """Tests for get_account"""

    def test_get_account_exists(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "id": "0x123",
            "base_score": 100,
            "total_score": 600,
        }
        mock_result.fetchone.return_value = mock_row

        mock_session.execute.return_value = mock_result
        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        account = db.get_account("0x123")

        assert account is not None
        assert account["id"] == "0x123"

    def test_get_account_not_exists(self, db, mock_session):
        mock_result = Mock()
        mock_result.fetchone.return_value = None

        mock_session.execute.return_value = mock_result
        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        account = db.get_account("0x999")

        assert account is None

    def test_get_account_lowercases_address(self, db, mock_session):
        mock_result = Mock()
        mock_result.fetchone.return_value = None

        mock_session.execute.return_value = mock_result
        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        db.get_account("0xABC")

        call_args = mock_session.execute.call_args
        assert call_args[0][1]["address"] == "0xabc"


class TestGetMintsForAccount:
    """Tests for get_mints_for_account"""

    def test_returns_mints(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "id": "mint1",
            "minter": "0x123",
            "quantity": 1,
            "minted_at": 1000,
        }
        mock_result.__iter__ = Mock(return_value=iter([mock_row]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        mints = db.get_mints_for_account("0x123")

        assert len(mints) == 1
        assert mints[0]["minter"] == "0x123"

    def test_empty_when_no_mints(self, db, mock_session):
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        mints = db.get_mints_for_account("0x123")

        assert len(mints) == 0


class TestGetLinkedWallets:
    """Tests for get_linked_wallets"""

    def test_returns_linked_wallets(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "address": "0x456",
            "linked_at": 1000,
            "zora_mint_count": 5,
            "early_mint_count": 2,
        }
        mock_result.__iter__ = Mock(return_value=iter([mock_row]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        wallets = db.get_linked_wallets("0x123")

        assert len(wallets) == 1
        assert wallets[0]["address"] == "0x456"
        assert wallets[0]["zora_mint_count"] == 5

    def test_empty_when_no_linked_wallets(self, db, mock_session):
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        wallets = db.get_linked_wallets("0x123")

        assert len(wallets) == 0


class TestMarkAccountUpdated:
    """Tests for mark_account_updated"""

    def test_marks_account_updated(self, db, mock_session):
        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        db.mark_account_updated("0x123")

        mock_session.execute.assert_called_once()
        mock_session.commit.assert_called_once()

    def test_lowercases_address(self, db, mock_session):
        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        db.mark_account_updated("0xABC")

        call_args = mock_session.execute.call_args
        assert call_args[0][1]["address"] == "0xabc"


class TestGetEarlyMinters:
    """Tests for get_early_minters"""

    def test_returns_early_minters(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "minter": "0x123",
            "early_mint_count": 5,
            "total_early_quantity": 7,
        }
        mock_result.__iter__ = Mock(return_value=iter([mock_row]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        minters = db.get_early_minters()

        assert len(minters) == 1
        assert minters[0]["minter"] == "0x123"
        assert minters[0]["early_mint_count"] == 5


class TestGetTierDistribution:
    """Tests for get_tier_distribution"""

    def test_returns_tier_distribution(self, db, mock_session):
        mock_result = Mock()
        mock_rows = [
            Mock(tier="Novice", count=100),
            Mock(tier="Bronze", count=50),
            Mock(tier="Silver", count=30),
            Mock(tier="Gold", count=15),
            Mock(tier="BASED", count=5),
        ]
        mock_result.__iter__ = Mock(return_value=iter(mock_rows))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        distribution = db.get_tier_distribution()

        assert distribution["Novice"] == 100
        assert distribution["Bronze"] == 50
        assert distribution["Silver"] == 30
        assert distribution["Gold"] == 15
        assert distribution["BASED"] == 5

    def test_empty_distribution(self, db, mock_session):
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        distribution = db.get_tier_distribution()

        assert distribution == {}


class TestGetTopAccounts:
    """Tests for get_top_accounts"""

    def test_returns_top_accounts(self, db, mock_session):
        mock_result = Mock()
        mock_row = Mock()
        mock_row._mapping = {
            "id": "0x123",
            "total_score": 5000,
            "tier": "BASED",
        }
        mock_result.__iter__ = Mock(return_value=iter([mock_row]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        accounts = db.get_top_accounts(limit=10)

        assert len(accounts) == 1
        assert accounts[0]["total_score"] == 5000

    def test_uses_correct_limit(self, db, mock_session):
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([]))
        mock_session.execute.return_value = mock_result

        db.Session.return_value.__enter__ = Mock(return_value=mock_session)
        db.Session.return_value.__exit__ = Mock(return_value=False)

        db.get_top_accounts(limit=50)

        call_args = mock_session.execute.call_args
        assert call_args[0][1]["limit"] == 50
