from __future__ import annotations
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class VerifyWalletRequest(BaseModel):
    wallet_address: str
    role: Optional[str] = None          # farmer | buyer | verifier | admin


class TokenResponse(BaseModel):
    token: str
    user: dict


# ── User ──────────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    name:     Optional[str] = None
    role:     Optional[str] = None
    phone:    Optional[str] = None
    location: Optional[str] = None


# ── Trade ─────────────────────────────────────────────────────────────────────

class TradeCreate(BaseModel):
    farmer_address:    str
    verifier_address:  str
    crop_type:         str
    quantity_kg:       float
    price_per_kg:      float
    delivery_deadline: datetime


class TradeOut(BaseModel):
    trade_id:             str
    app_id:               Optional[int]
    farmer_address:       str
    buyer_address:        str
    verifier_address:     str
    crop_type:            str
    quantity_kg:          float
    price_per_kg:         float
    total_amount_algo:    float
    delivery_deadline:    datetime
    state:                str
    delivery_proof_ipfs:  Optional[str]
    dispute_votes_farmer: int
    dispute_votes_buyer:  int
    created_at:           Optional[datetime]
    updated_at:           Optional[datetime]
    on_chain:             Optional[dict] = None


# ── Verifier ──────────────────────────────────────────────────────────────────

class VerifierAdd(BaseModel):
    wallet_address: str
    name:           Optional[str] = ""
    location:       Optional[str] = ""


# ── Blockchain ────────────────────────────────────────────────────────────────

class SubmitTxnRequest(BaseModel):
    signed_txn: str             # base64-encoded signed transaction bytes


class VoteDisputeRequest(BaseModel):
    in_favor_of_farmer: bool


# ── Generic response wrapper ──────────────────────────────────────────────────

class ApiResponse(BaseModel):
    success: bool
    data:    Optional[Any] = None
    error:   Optional[str] = None
