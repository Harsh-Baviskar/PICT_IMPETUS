import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from database import get_db
from models.schemas import TradeCreate, SubmitTxnRequest, VoteDisputeRequest, ApiResponse
from services.auth import get_current_user
from services import algorand, ipfs as ipfs_service

router = APIRouter(prefix="/api/trades", tags=["trades"])


def _clean(doc: dict) -> dict:
    """Stringify MongoDB _id for JSON serialisation."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ── GET /api/trades ───────────────────────────────────────────────────────────

@router.get("", response_model=ApiResponse)
async def list_trades(current_user: dict = Depends(get_current_user)):
    """Return all trades where the current wallet is buyer, farmer, or verifier."""
    db     = get_db()
    addr   = current_user["wallet_address"]
    cursor = db.trades.find({
        "$or": [
            {"farmer_address":   addr},
            {"buyer_address":    addr},
            {"verifier_address": addr},
        ]
    }).sort("created_at", -1)
    trades = [_clean(t) async for t in cursor]
    return ApiResponse(success=True, data=trades)


# ── GET /api/trades/pending-verification — must be defined before /:trade_id ──

@router.get("/pending-verification", response_model=ApiResponse)
async def pending_verification(current_user: dict = Depends(get_current_user)):
    """Trades assigned to this verifier that are in DELIVERED state."""
    db     = get_db()
    cursor = db.trades.find({
        "verifier_address": current_user["wallet_address"],
        "state": "DELIVERED",
    }).sort("created_at", -1)
    trades = [_clean(t) async for t in cursor]
    return ApiResponse(success=True, data=trades)


# ── GET /api/trades/{trade_id} ────────────────────────────────────────────────

@router.get("/{trade_id}", response_model=ApiResponse)
async def get_trade(trade_id: str):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    _clean(trade)

    # Merge live on-chain state if contract is deployed
    on_chain = None
    if trade.get("app_id"):
        on_chain = await algorand.get_contract_state(trade["app_id"])

    trade["on_chain"] = on_chain
    return ApiResponse(success=True, data=trade)


# ── GET /api/trades/{trade_id}/status ────────────────────────────────────────

@router.get("/{trade_id}/status", response_model=ApiResponse)
async def trade_status(trade_id: str):
    """Lightweight polling endpoint — returns current state only."""
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    state = trade["state"]
    if trade.get("app_id"):
        on_chain = await algorand.get_contract_state(trade["app_id"])
        if on_chain and "state" in on_chain:
            state = algorand.state_int_to_string(on_chain["state"])
            # Sync DB if on-chain state has advanced
            if state != trade["state"]:
                await db.trades.update_one(
                    {"trade_id": trade_id},
                    {"$set": {"state": state, "updated_at": datetime.now(timezone.utc)}},
                )

    return ApiResponse(success=True, data={"trade_id": trade_id, "state": state})


# ── POST /api/trades ──────────────────────────────────────────────────────────

@router.post("", status_code=201, response_model=ApiResponse)
async def create_trade(
    body: TradeCreate,
    current_user: dict = Depends(get_current_user),
):
    db              = get_db()
    trade_id        = str(uuid.uuid4())
    total_amount    = round(body.quantity_kg * body.price_per_kg, 6)
    buyer_address   = current_user["wallet_address"]
    now             = datetime.now(timezone.utc)

    doc = {
        "trade_id":             trade_id,
        "app_id":               None,       # filled on Day 3 after contract deploy
        "farmer_address":       body.farmer_address,
        "buyer_address":        buyer_address,
        "verifier_address":     body.verifier_address,
        "crop_type":            body.crop_type,
        "quantity_kg":          body.quantity_kg,
        "price_per_kg":         body.price_per_kg,
        "total_amount_algo":    total_amount,
        "delivery_deadline":    body.delivery_deadline,
        "state":                "CREATED",
        "delivery_proof_ipfs":  None,
        "dispute_votes_farmer": 0,
        "dispute_votes_buyer":  0,
        "created_at":           now,
        "updated_at":           now,
    }

    # TODO Day 3: deploy contract and set app_id
    # doc["app_id"] = await algorand.deploy_contract(doc)

    await db.trades.insert_one(doc)
    _clean(doc)
    return ApiResponse(success=True, data=doc)


# ── POST /api/trades/{trade_id}/fund ─────────────────────────────────────────

@router.post("/{trade_id}/fund", response_model=ApiResponse)
async def fund_trade(
    trade_id: str,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] != "CREATED":
        raise HTTPException(status_code=400, detail="Trade not in CREATED state")

    try:
        unsigned_txn = await algorand.build_fund_txn(trade)
        return ApiResponse(success=True, data={"unsigned_txn": unsigned_txn})
    except NotImplementedError as e:
        return ApiResponse(success=True, data={"message": str(e)})


# ── POST /api/trades/{trade_id}/deliver ──────────────────────────────────────

@router.post("/{trade_id}/deliver", response_model=ApiResponse)
async def mark_delivered(
    trade_id: str,
    proof: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] != "FUNDED":
        raise HTTPException(status_code=400, detail="Trade not in FUNDED state")

    ipfs_cid = None
    if proof:
        # TODO Day 3: uncomment when Pinata keys are set
        # content  = await proof.read()
        # ipfs_cid = await ipfs_service.upload(content, proof.filename, trade_id)
        pass

    await db.trades.update_one(
        {"trade_id": trade_id},
        {"$set": {
            "state":               "DELIVERED",
            "delivery_proof_ipfs": ipfs_cid,
            "updated_at":          datetime.now(timezone.utc),
        }},
    )
    return ApiResponse(success=True, data={"state": "DELIVERED", "ipfs_cid": ipfs_cid})


# ── POST /api/trades/{trade_id}/confirm ──────────────────────────────────────

@router.post("/{trade_id}/confirm", response_model=ApiResponse)
async def confirm_delivery(
    trade_id: str,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] != "DELIVERED":
        raise HTTPException(status_code=400, detail="Trade not in DELIVERED state")

    try:
        unsigned_txn = await algorand.build_confirm_txn(trade)
        return ApiResponse(success=True, data={"unsigned_txn": unsigned_txn})
    except NotImplementedError as e:
        return ApiResponse(success=True, data={"message": str(e)})


# ── POST /api/trades/{trade_id}/dispute ──────────────────────────────────────

@router.post("/{trade_id}/dispute", response_model=ApiResponse)
async def raise_dispute(
    trade_id: str,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] not in ("FUNDED", "DELIVERED"):
        raise HTTPException(status_code=400, detail="Cannot dispute in current state")

    try:
        unsigned_txn = await algorand.build_dispute_txn(trade)
        return ApiResponse(success=True, data={"unsigned_txn": unsigned_txn})
    except NotImplementedError as e:
        return ApiResponse(success=True, data={"message": str(e)})


# ── POST /api/trades/{trade_id}/refund ───────────────────────────────────────

@router.post("/{trade_id}/refund", response_model=ApiResponse)
async def claim_refund(
    trade_id: str,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] != "FUNDED":
        raise HTTPException(status_code=400, detail="Trade not in FUNDED state")
    if trade["delivery_deadline"] > datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Delivery deadline has not yet passed")

    try:
        unsigned_txn = await algorand.build_refund_txn(trade)
        return ApiResponse(success=True, data={"unsigned_txn": unsigned_txn})
    except NotImplementedError as e:
        return ApiResponse(success=True, data={"message": str(e)})


# ── POST /api/trades/{trade_id}/submit-txn ───────────────────────────────────

@router.post("/{trade_id}/submit-txn", response_model=ApiResponse)
async def submit_txn(
    trade_id: str,
    body: SubmitTxnRequest,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    try:
        txid = await algorand.submit_signed_txn(body.signed_txn)
        # Sync DB state after on-chain confirmation
        if trade.get("app_id"):
            on_chain = await algorand.get_contract_state(trade["app_id"])
            if on_chain and "state" in on_chain:
                new_state = algorand.state_int_to_string(on_chain["state"])
                await db.trades.update_one(
                    {"trade_id": trade_id},
                    {"$set": {"state": new_state, "updated_at": datetime.now(timezone.utc)}},
                )
        return ApiResponse(success=True, data={"txid": txid})
    except NotImplementedError as e:
        return ApiResponse(success=True, data={"message": str(e), "txid": None})


# ── POST /api/trades/{trade_id}/vote-dispute ─────────────────────────────────

@router.post("/{trade_id}/vote-dispute", response_model=ApiResponse)
async def vote_dispute(
    trade_id: str,
    body: VoteDisputeRequest,
    current_user: dict = Depends(get_current_user),
):
    db    = get_db()
    trade = await db.trades.find_one({"trade_id": trade_id})
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade["state"] != "DISPUTED":
        raise HTTPException(status_code=400, detail="Trade not in DISPUTED state")

    # TODO Day 3: build vote_dispute txn via algorand
    return ApiResponse(
        success=True,
        data={"message": "vote_dispute txn builder — implement in algorand.py on Day 3"},
    )
