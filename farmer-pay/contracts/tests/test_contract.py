"""
Unit tests for FarmerEscrow contract.

Run with:  algokit project run test
Or:        pytest tests/test_contract.py -v

These tests use algokit-utils + algopy testing harness.
Fill in the imports below once `algokit init` has been run.
"""

import pytest


# ── Fixtures ──────────────────────────────────────────────────────────────────
# TODO (Day 1): uncomment and complete after running `algokit init`

# from algokit_utils import AlgorandClient, ApplicationClient
# from smart_contracts.farmer_escrow.contract import FarmerEscrow

# AMOUNT = 2_000_000  # 2 ALGO in microALGO
# DEADLINE_FUTURE = int(time.time()) + 86_400   # 24 hours from now
# DEADLINE_PAST   = int(time.time()) - 3_600    # 1 hour ago

# @pytest.fixture(scope="session")
# def algorand():
#     return AlgorandClient.default_local_net()

# @pytest.fixture()
# def accounts(algorand):
#     buyer    = algorand.account.random()
#     farmer   = algorand.account.random()
#     verifier = algorand.account.random()
#     # Fund all accounts from dispenser
#     for acct in [buyer, farmer, verifier]:
#         algorand.account.ensure_funded(acct, dispenser=algorand.account.dispenser(), min_spending_balance_micro_algos=10_000_000)
#     return {"buyer": buyer, "farmer": farmer, "verifier": verifier}

# @pytest.fixture()
# def client(algorand, accounts):
#     return ApplicationClient(
#         algod_client=algorand.client.algod,
#         app_spec=FarmerEscrow(),
#         signer=accounts["buyer"].signer,
#         sender=accounts["buyer"].address,
#     )


# ── Happy path ────────────────────────────────────────────────────────────────

class TestHappyPath:

    def test_create_trade(self):
        """
        Buyer creates a trade.
        State must be CREATED (0) after creation.

        TODO: deploy contract with create_trade(farmer, buyer, verifier, amount, deadline)
              assert global_state["state"] == 0
        """
        pass

    def test_fund_escrow(self):
        """
        Buyer funds the escrow.
        State must be FUNDED (1).
        Contract address must hold exactly amount_micro_algo.

        TODO: build atomic group [payment_txn, fund_escrow app_call]
              assert state == 1
              assert algo_balance(app_address) == AMOUNT
        """
        pass

    def test_mark_delivered(self):
        """
        Farmer marks delivery after receiving the crop.
        State must be DELIVERED (2).

        TODO: call mark_delivered() as farmer
              assert state == 2
        """
        pass

    def test_confirm_delivery_releases_payment(self):
        """
        Verifier confirms delivery.
        State must be RELEASED (3).
        Farmer wallet balance must increase by AMOUNT.
        Contract must hold 0 ALGO.

        TODO: record farmer balance before
              call confirm_delivery() as verifier
              assert state == 3
              assert farmer_balance_after - farmer_balance_before == AMOUNT
              assert algo_balance(app_address) == 0
        """
        pass


# ── Dispute path ──────────────────────────────────────────────────────────────

class TestDisputePath:

    def test_raise_dispute_from_funded(self):
        """
        Buyer raises dispute while state is FUNDED.
        State must become DISPUTED (4).

        TODO: fund escrow, then call raise_dispute() as buyer
              assert state == 4
        """
        pass

    def test_raise_dispute_from_delivered(self):
        """
        Buyer raises dispute while state is DELIVERED.
        State must become DISPUTED (4).

        TODO: fund + mark_delivered, then call raise_dispute() as buyer
              assert state == 4
        """
        pass


# ── Expiry path ───────────────────────────────────────────────────────────────

class TestExpiryPath:

    def test_claim_refund_after_deadline(self):
        """
        Buyer claims refund after the delivery_deadline passes.
        State must be EXPIRED (5).
        Buyer balance must increase by AMOUNT.

        TODO: create trade with DEADLINE_PAST
              fund escrow
              call claim_refund() as buyer
              assert state == 5
              assert buyer_balance_after - buyer_balance_before == AMOUNT
        """
        pass


# ── Cancel path ───────────────────────────────────────────────────────────────

class TestCancelPath:

    def test_cancel_unfunded_trade(self):
        """
        Buyer cancels before funding.
        State must be CANCELLED (6).

        TODO: create trade, do NOT fund
              call cancel_trade() as buyer
              assert state == 6
        """
        pass

    def test_farmer_can_cancel_unfunded(self):
        """
        Farmer can also cancel before funding.

        TODO: create trade, call cancel_trade() as farmer
              assert state == 6
        """
        pass


# ── Access control ────────────────────────────────────────────────────────────

class TestAccessControl:

    def test_non_buyer_cannot_fund(self):
        """
        Farmer or verifier trying to fund must fail.

        TODO: call fund_escrow() signed as farmer
              assert raises error / rejected transaction
        """
        pass

    def test_non_farmer_cannot_mark_delivered(self):
        """
        Buyer or verifier cannot mark delivery.

        TODO: call mark_delivered() as buyer
              assert raises error
        """
        pass

    def test_non_verifier_cannot_confirm(self):
        """
        Buyer or farmer cannot confirm delivery.

        TODO: call confirm_delivery() as buyer
              assert raises error
        """
        pass

    def test_cannot_claim_refund_before_deadline(self):
        """
        Buyer cannot refund before deadline_passes.

        TODO: create trade with DEADLINE_FUTURE
              fund escrow
              call claim_refund() — assert error raised
        """
        pass

    def test_cannot_cancel_funded_trade(self):
        """
        Nobody can cancel once escrow is funded.

        TODO: fund escrow
              call cancel_trade() — assert error raised
        """
        pass
