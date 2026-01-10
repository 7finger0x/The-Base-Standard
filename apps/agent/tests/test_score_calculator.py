"""
Tests for ScoreCalculator
"""

import pytest
import time
from unittest.mock import patch
from score_calculator import ScoreCalculator


@pytest.fixture
def calculator():
    return ScoreCalculator()


@pytest.fixture
def mock_current_time():
    return 1700000000  # Fixed timestamp for testing


class TestBaseTenure:
    """Tests for base tenure calculation"""

    def test_calculate_base_tenure_single_day(self, calculator):
        with patch('time.time', return_value=1700000000):
            # First tx exactly 1 day ago
            first_tx = 1700000000 - 86400
            score = calculator._calculate_base_tenure(first_tx)
            assert score == 1

    def test_calculate_base_tenure_multiple_days(self, calculator):
        with patch('time.time', return_value=1700000000):
            # First tx 30 days ago
            first_tx = 1700000000 - (86400 * 30)
            score = calculator._calculate_base_tenure(first_tx)
            assert score == 30

    def test_calculate_base_tenure_zero_days(self, calculator):
        with patch('time.time', return_value=1700000000):
            # First tx is now
            first_tx = 1700000000
            score = calculator._calculate_base_tenure(first_tx)
            assert score == 0

    def test_calculate_base_tenure_none(self, calculator):
        score = calculator._calculate_base_tenure(None)
        assert score == 0

    def test_calculate_base_tenure_partial_day(self, calculator):
        with patch('time.time', return_value=1700000000):
            # First tx 1.5 days ago (should round down to 1 day)
            first_tx = 1700000000 - (86400 + 43200)
            score = calculator._calculate_base_tenure(first_tx)
            assert score == 1

    def test_calculate_base_tenure_year(self, calculator):
        with patch('time.time', return_value=1700000000):
            # First tx 365 days ago
            first_tx = 1700000000 - (86400 * 365)
            score = calculator._calculate_base_tenure(first_tx)
            assert score == 365


class TestZoraScore:
    """Tests for Zora mint scoring"""

    def test_calculate_zora_score_no_mints(self, calculator):
        score = calculator._calculate_zora_score([])
        assert score == 0

    def test_calculate_zora_score_single_mint(self, calculator):
        mints = [{"quantity": 1}]
        score = calculator._calculate_zora_score(mints)
        assert score == 10

    def test_calculate_zora_score_multiple_single_mints(self, calculator):
        mints = [{"quantity": 1}, {"quantity": 1}, {"quantity": 1}]
        score = calculator._calculate_zora_score(mints)
        assert score == 30

    def test_calculate_zora_score_batch_mint(self, calculator):
        mints = [{"quantity": 5}]
        score = calculator._calculate_zora_score(mints)
        assert score == 50

    def test_calculate_zora_score_mixed_quantities(self, calculator):
        mints = [
            {"quantity": 1},
            {"quantity": 5},
            {"quantity": 10},
        ]
        score = calculator._calculate_zora_score(mints)
        assert score == 160  # (1 + 5 + 10) * 10

    def test_calculate_zora_score_default_quantity(self, calculator):
        # Missing quantity should default to 1
        mints = [{}]
        score = calculator._calculate_zora_score(mints)
        assert score == 10


class TestTimelinessScore:
    """Tests for timeliness bonus calculation"""

    def test_early_mint_detection_within_24h(self, calculator):
        mint = {
            "minted_at": 1000,
            "collection_deployed_at": 500,
            "quantity": 1
        }
        assert calculator._is_early_mint(mint) is True

    def test_early_mint_detection_exactly_24h(self, calculator):
        mint = {
            "minted_at": 86400,
            "collection_deployed_at": 0,
            "quantity": 1
        }
        # Exactly at 24h boundary should NOT be early
        assert calculator._is_early_mint(mint) is False

    def test_early_mint_detection_after_24h(self, calculator):
        mint = {
            "minted_at": 90000,
            "collection_deployed_at": 0,
            "quantity": 1
        }
        assert calculator._is_early_mint(mint) is False

    def test_early_mint_detection_missing_timestamps(self, calculator):
        assert calculator._is_early_mint({}) is False
        assert calculator._is_early_mint({"minted_at": 1000}) is False
        assert calculator._is_early_mint({"collection_deployed_at": 1000}) is False

    def test_early_mint_detection_before_deployment(self, calculator):
        # Mint before deployment should not be early (impossible scenario)
        mint = {
            "minted_at": 500,
            "collection_deployed_at": 1000,
            "quantity": 1
        }
        assert calculator._is_early_mint(mint) is False

    def test_timeliness_score_no_mints(self, calculator):
        score = calculator._calculate_timeliness_score([])
        assert score == 0

    def test_timeliness_score_single_early_mint(self, calculator):
        mints = [{
            "minted_at": 1000,
            "collection_deployed_at": 500,
            "quantity": 1
        }]
        score = calculator._calculate_timeliness_score(mints)
        assert score == 100

    def test_timeliness_score_multiple_early_mints(self, calculator):
        mints = [
            {"minted_at": 1000, "collection_deployed_at": 500, "quantity": 1},
            {"minted_at": 2000, "collection_deployed_at": 1500, "quantity": 1},
        ]
        score = calculator._calculate_timeliness_score(mints)
        assert score == 200

    def test_timeliness_score_mixed_early_late(self, calculator):
        mints = [
            {"minted_at": 1000, "collection_deployed_at": 500, "quantity": 1},  # Early
            {"minted_at": 100000, "collection_deployed_at": 500, "quantity": 1},  # Late
        ]
        score = calculator._calculate_timeliness_score(mints)
        assert score == 100

    def test_timeliness_score_with_is_early_mint_flag(self, calculator):
        mints = [{"is_early_mint": True, "quantity": 1}]
        score = calculator._calculate_timeliness_score(mints)
        assert score == 100

    def test_timeliness_score_batch_early_mint(self, calculator):
        mints = [{
            "minted_at": 1000,
            "collection_deployed_at": 500,
            "quantity": 5
        }]
        score = calculator._calculate_timeliness_score(mints)
        assert score == 500  # 5 * 100


class TestTierCalculation:
    """Tests for tier assignment"""

    def test_tier_novice(self, calculator):
        assert calculator.get_tier(0) == "Novice"
        assert calculator.get_tier(50) == "Novice"
        assert calculator.get_tier(99) == "Novice"

    def test_tier_bronze(self, calculator):
        assert calculator.get_tier(100) == "Bronze"
        assert calculator.get_tier(250) == "Bronze"
        assert calculator.get_tier(499) == "Bronze"

    def test_tier_silver(self, calculator):
        assert calculator.get_tier(500) == "Silver"
        assert calculator.get_tier(700) == "Silver"
        assert calculator.get_tier(849) == "Silver"

    def test_tier_gold(self, calculator):
        assert calculator.get_tier(850) == "Gold"
        assert calculator.get_tier(900) == "Gold"
        assert calculator.get_tier(999) == "Gold"

    def test_tier_based(self, calculator):
        assert calculator.get_tier(1000) == "BASED"
        assert calculator.get_tier(5000) == "BASED"
        assert calculator.get_tier(10000) == "BASED"


class TestTotalScoreCalculation:
    """Tests for complete score calculation"""

    def test_calculate_total_score_all_zeros(self, calculator):
        with patch('time.time', return_value=1700000000):
            score = calculator.calculate_total_score(
                account_id="0x123",
                mints=[],
                first_tx_timestamp=None,
                linked_wallets=None
            )
            assert score == 0

    def test_calculate_total_score_only_tenure(self, calculator):
        with patch('time.time', return_value=1700000000):
            first_tx = 1700000000 - (86400 * 30)  # 30 days ago
            score = calculator.calculate_total_score(
                account_id="0x123",
                mints=[],
                first_tx_timestamp=first_tx,
                linked_wallets=None
            )
            assert score == 30

    def test_calculate_total_score_only_mints(self, calculator):
        mints = [
            {"quantity": 1},
            {"quantity": 1},
        ]
        score = calculator.calculate_total_score(
            account_id="0x123",
            mints=mints,
            first_tx_timestamp=None,
            linked_wallets=None
        )
        assert score == 20  # 2 mints * 10 points

    def test_calculate_total_score_complete(self, calculator):
        with patch('time.time', return_value=1700000000):
            first_tx = 1700000000 - (86400 * 100)  # 100 days
            mints = [
                {"minted_at": 1000, "collection_deployed_at": 500, "quantity": 1},  # Early
                {"minted_at": 2000, "collection_deployed_at": 1500, "quantity": 1},  # Early
                {"quantity": 1},  # Regular
            ]
            score = calculator.calculate_total_score(
                account_id="0x123",
                mints=mints,
                first_tx_timestamp=first_tx,
                linked_wallets=None
            )
            # 100 (tenure) + 30 (3 mints) + 200 (2 early) = 330
            assert score == 330

    def test_calculate_total_score_with_linked_wallets(self, calculator):
        with patch('time.time', return_value=1700000000):
            linked_wallets = [
                {
                    "first_tx_timestamp": 1700000000 - (86400 * 50),
                    "zora_mint_count": 3,
                    "early_mint_count": 1,
                }
            ]
            score = calculator.calculate_total_score(
                account_id="0x123",
                mints=[],
                first_tx_timestamp=1700000000 - (86400 * 50),
                linked_wallets=linked_wallets
            )
            # Main: 50 (tenure) + Linked: 50 (tenure) + 30 (3 mints) + 100 (1 early) = 230
            assert score == 230


class TestScoreBreakdown:
    """Tests for detailed score breakdown"""

    def test_score_breakdown_structure(self, calculator):
        with patch('time.time', return_value=1700000000):
            breakdown = calculator.calculate_score_breakdown(
                account_id="0x123",
                mints=[],
                first_tx_timestamp=1700000000 - (86400 * 30),
                linked_wallets=None
            )

            assert "total_score" in breakdown
            assert "tier" in breakdown
            assert "breakdown" in breakdown
            assert "base_tenure" in breakdown["breakdown"]
            assert "zora_mints" in breakdown["breakdown"]
            assert "timeliness" in breakdown["breakdown"]

    def test_score_breakdown_values(self, calculator):
        with patch('time.time', return_value=1700000000):
            first_tx = 1700000000 - (86400 * 30)
            mints = [
                {"minted_at": 1000, "collection_deployed_at": 500, "quantity": 1},
                {"quantity": 1},
            ]
            breakdown = calculator.calculate_score_breakdown(
                account_id="0x123",
                mints=mints,
                first_tx_timestamp=first_tx,
                linked_wallets=None
            )

            assert breakdown["total_score"] == 150  # 30 + 20 + 100
            assert breakdown["tier"] == "Bronze"
            assert breakdown["breakdown"]["base_tenure"]["score"] == 30
            assert breakdown["breakdown"]["base_tenure"]["days"] == 30
            assert breakdown["breakdown"]["zora_mints"]["score"] == 20
            assert breakdown["breakdown"]["zora_mints"]["count"] == 2
            assert breakdown["breakdown"]["zora_mints"]["early_mints"] == 1
            assert breakdown["breakdown"]["timeliness"]["score"] == 100
