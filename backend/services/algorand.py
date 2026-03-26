"""
algorand.py — algosdk wrapper for all on-chain interactions.

All blockchain logic lives here. Routes stay thin.
Day 3 TODOs are clearly marked — stubs return sensible messages
so the rest of the stack can develop without a deployed contract.
"""

from algosdk.v2client import algod, indexer
from config import settings

# ── Clients ───────────────────────────────────────────────────────────────────

def get_algod() -> algod.AlgodClient:
    return algod.AlgodClient("", settings.algorand_node)


def get_indexer() -> indexer.IndexerClient:
    return indexer.IndexerClient("", settings.algorand_indexer)


# ── State helpers ─────────────────────────────────────────────────────────────

_STATE_MAP = {
    0: "CREATED",
    1: "FUNDED",
    2: "DELIVERED",
    3: "RELEASED",
    4: "DISPUTED",
    5: "EXPIRED",
    6: "CANCELLED",
}


def state_int_to_string(val: int) -> str:
    return _STATE_MAP.get(int(val), "CREATED")


# ── On-chain contract state ───────────────────────────────────────────────────

async def get_contract_state(app_id: int) -> dict | None:
    """Fetch and decode global state of a deployed contract."""
    try:
        client = get_algod()
        app    = client.application_info(app_id)
        raw    = app["params"].get("global-state", [])
        state  = {}
        for kv in raw:
            import base64
            key = base64.b64decode(kv["key"]).decode("utf-8", errors="replace")
            val = kv["value"]
            state[key] = val["bytes"] if val["type"] == 1 else val["uint"]
        return state
    except Exception as exc:
        print(f"get_contract_state error: {exc}")
        return None


# ── Account info ──────────────────────────────────────────────────────────────

async def get_account_info(address: str) -> dict | None:
    try:
        return get_algod().account_info(address)
    except Exception as exc:
        print(f"get_account_info error: {exc}")
        return None


# ── Transaction history ───────────────────────────────────────────────────────

async def get_address_transactions(address: str, limit: int = 20) -> list:
    try:
        idx    = get_indexer()
        result = idx.search_transactions_by_address(address, limit=limit)
        return result.get("transactions", [])
    except Exception as exc:
        print(f"get_address_transactions error: {exc}")
        return []


# ── Build unsigned txns (stub — implement Day 3) ──────────────────────────────

async def build_fund_txn(trade: dict) -> str:
    """
    Build atomic group: [PaymentTxn, AppCallTxn(fund_escrow)].
    Returns base64-encoded unsigned txn group for frontend to sign.

    TODO Day 3:
        from algosdk import transaction
        client = get_algod()
        app_id = settings.contract_app_id
        sp     = client.suggested_params()

        pay_txn = transaction.PaymentTxn(
            sender=trade["buyer_address"],
            sp=sp,
            receiver=transaction.encoding.encode_address(
                transaction.logic.get_application_address(app_id)
            ),
            amt=int(trade["total_amount_algo"] * 1_000_000),
        )
        app_txn = transaction.ApplicationCallTxn(
            sender=trade["buyer_address"],
            sp=sp,
            index=app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[b"fund_escrow"],
        )
        transaction.assign_group_id([pay_txn, app_txn])

        import base64
        return base64.b64encode(
            pay_txn.serialize() + app_txn.serialize()
        ).decode()
    """
    raise NotImplementedError("build_fund_txn — implement in algorand.py on Day 3")


async def build_confirm_txn(trade: dict) -> str:
    """
    Build AppCallTxn(confirm_delivery) for verifier to sign.

    TODO Day 3:
        from algosdk import transaction
        client = get_algod()
        sp     = client.suggested_params()
        txn    = transaction.ApplicationCallTxn(
            sender=trade["verifier_address"],
            sp=sp,
            index=settings.contract_app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[b"confirm_delivery"],
            accounts=[trade["farmer_address"]],
        )
        import base64
        return base64.b64encode(txn.serialize()).decode()
    """
    raise NotImplementedError("build_confirm_txn — implement in algorand.py on Day 3")


async def build_dispute_txn(trade: dict) -> str:
    # TODO Day 3 — same pattern as build_confirm_txn with app_args=[b"raise_dispute"]
    raise NotImplementedError("build_dispute_txn — implement in algorand.py on Day 3")


async def build_refund_txn(trade: dict) -> str:
    # TODO Day 3 — same pattern with app_args=[b"claim_refund"]
    raise NotImplementedError("build_refund_txn — implement in algorand.py on Day 3")


# ── Submit signed txn ─────────────────────────────────────────────────────────

async def submit_signed_txn(signed_b64: str) -> str:
    """
    Decode base64 signed txn bytes, submit to Algorand, wait for confirmation.
    Returns txid string.

    TODO Day 3:
        import base64
        from algosdk import transaction
        client      = get_algod()
        signed_bytes = base64.b64decode(signed_b64)
        txid         = client.send_raw_transaction(signed_bytes)
        transaction.wait_for_confirmation(client, txid, 4)
        return txid
    """
    raise NotImplementedError("submit_signed_txn — implement in algorand.py on Day 3")


# ── Startup connectivity check ────────────────────────────────────────────────

async def ping() -> bool:
    try:
        status = get_algod().status()
        print(f"Algorand node connected. Round: {status['last-round']}")
        return True
    except Exception as exc:
        print(f"Algorand node unreachable: {exc}")
        return False
