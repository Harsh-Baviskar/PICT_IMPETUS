from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models.schemas import UserUpdate, ApiResponse
from services.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{address}", response_model=ApiResponse)
async def get_user(address: str):
    db   = get_db()
    user = await db.users.find_one({"wallet_address": address})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return ApiResponse(success=True, data=user)


@router.post("", response_model=ApiResponse)
async def update_user(
    body: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    db      = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)

    user = await db.users.find_one_and_update(
        {"wallet_address": current_user["wallet_address"]},
        {"$set": updates},
        return_document=True,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return ApiResponse(success=True, data=user)
