from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models.schemas import VerifierAdd, ApiResponse
from services.auth import get_current_user, require_role
from datetime import datetime, timezone

router = APIRouter(prefix="/api/verifiers", tags=["verifiers"])


@router.get("", response_model=ApiResponse)
async def list_verifiers(_: dict = Depends(get_current_user)):
    """List all whitelisted verifiers. Any authenticated user can view."""
    db      = get_db()
    cursor  = db.users.find({"role": "verifier"}).sort("trades_completed", -1)
    results = []
    async for u in cursor:
        u["_id"] = str(u["_id"])
        results.append(u)
    return ApiResponse(success=True, data=results)


@router.post("", response_model=ApiResponse)
async def add_verifier(
    body: VerifierAdd,
    current_user: dict = Depends(require_role("admin")),
):
    """Add a wallet address to the verifier whitelist. Admin only."""
    db  = get_db()
    now = datetime.now(timezone.utc)
    user = await db.users.find_one_and_update(
        {"wallet_address": body.wallet_address},
        {
            "$set":         {"role": "verifier", "name": body.name, "location": body.location, "updated_at": now},
            "$setOnInsert": {"wallet_address": body.wallet_address, "trades_completed": 0,
                             "total_earned_algo": 0.0, "phone": "", "created_at": now},
        },
        upsert=True,
        return_document=True,
    )
    user["_id"] = str(user["_id"])
    return ApiResponse(success=True, data=user)


@router.delete("/{address}", response_model=ApiResponse)
async def remove_verifier(
    address: str,
    current_user: dict = Depends(require_role("admin")),
):
    """Downgrade a verifier back to farmer role. Admin only."""
    db = get_db()
    await db.users.update_one(
        {"wallet_address": address, "role": "verifier"},
        {"$set": {"role": "farmer", "updated_at": datetime.now(timezone.utc)}},
    )
    return ApiResponse(success=True, data={"removed": address})
