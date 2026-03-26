from algopy import ARC4Contract, String, UInt64, Account, Txn, Global, arc4, itxn


class FarmerEscrow(ARC4Contract):
    # ── State variables ───────────────────────────────────────────────────────
    trade_id:             String
    farmer_address:       Account
    buyer_address:        Account
    verifier_address:     Account
    amount_micro_algo:    UInt64
    delivery_deadline:    UInt64
    state:                UInt64   # 0=CREATED 1=FUNDED 2=DELIVERED 3=RELEASED 4=DISPUTED 5=EXPIRED 6=CANCELLED
    dispute_votes_farmer: UInt64
    dispute_votes_buyer:  UInt64

    # ── Create trade ──────────────────────────────────────────────────────────
    @arc4.abimethod
    def create_trade(
        self,
        trade_id:  String,
        farmer:    Account,
        buyer:     Account,
        verifier:  Account,
        amount:    UInt64,
        deadline:  UInt64,
    ) -> None:
        assert Txn.sender == buyer, "Only buyer can create"
        self.trade_id             = trade_id
        self.farmer_address       = farmer
        self.buyer_address        = buyer
        self.verifier_address     = verifier
        self.amount_micro_algo    = amount
        self.delivery_deadline    = deadline
        self.state                = UInt64(0)
        self.dispute_votes_farmer = UInt64(0)
        self.dispute_votes_buyer  = UInt64(0)

    # ── Fund escrow ───────────────────────────────────────────────────────────
    @arc4.abimethod
    def fund_escrow(self) -> None:
        assert self.state == UInt64(0), "Not in CREATED state"
        assert Txn.sender == self.buyer_address, "Only buyer can fund"
        # Caller must attach a payment txn in the same atomic group (index 0)
        self.state = UInt64(1)

    # ── Mark delivered ────────────────────────────────────────────────────────
    @arc4.abimethod
    def mark_delivered(self) -> None:
        assert self.state == UInt64(1), "Not in FUNDED state"
        assert Txn.sender == self.farmer_address, "Only farmer can mark delivery"
        self.state = UInt64(2)

    # ── Confirm delivery — triggers payment ───────────────────────────────────
    @arc4.abimethod
    def confirm_delivery(self) -> None:
        assert self.state == UInt64(2), "Not in DELIVERED state"
        assert Txn.sender == self.verifier_address, "Only verifier can confirm"
        itxn.Payment(
            receiver=self.farmer_address,
            amount=self.amount_micro_algo,
        ).submit()
        self.state = UInt64(3)

    # ── Raise dispute ─────────────────────────────────────────────────────────
    @arc4.abimethod
    def raise_dispute(self) -> None:
        assert self.state == UInt64(1) or self.state == UInt64(2), "Can only dispute FUNDED or DELIVERED"
        assert Txn.sender == self.buyer_address, "Only buyer can raise dispute"
        self.state = UInt64(4)

    # ── Vote on dispute (3 validators, majority wins) ─────────────────────────
    # TODO (Day 3): implement dispute_validators array and voting logic
    # @arc4.abimethod
    # def vote_dispute(self, in_favor_of_farmer: bool) -> None:
    #     assert self.state == UInt64(4), "Not in DISPUTED state"
    #     # check sender in dispute_validators
    #     # increment votes, auto-resolve on majority

    # ── Claim refund after deadline ───────────────────────────────────────────
    @arc4.abimethod
    def claim_refund(self) -> None:
        assert self.state == UInt64(1), "Must be in FUNDED state"
        assert Global.latest_timestamp > self.delivery_deadline, "Deadline not yet passed"
        assert Txn.sender == self.buyer_address, "Only buyer can claim refund"
        itxn.Payment(
            receiver=self.buyer_address,
            amount=self.amount_micro_algo,
        ).submit()
        self.state = UInt64(5)

    # ── Cancel trade (only before funding) ────────────────────────────────────
    @arc4.abimethod
    def cancel_trade(self) -> None:
        assert self.state == UInt64(0), "Can only cancel unfunded trade"
        assert (
            Txn.sender == self.buyer_address or Txn.sender == self.farmer_address
        ), "Only buyer or farmer can cancel"
        self.state = UInt64(6)
