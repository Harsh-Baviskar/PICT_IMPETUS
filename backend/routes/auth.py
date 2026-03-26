from fastapi import APIRouter
from database import get_db
from models.schemas import VerifyWalletRequest, ApiResponse
from services.auth import create_token
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/verify-wallet", response_model=ApiResponse)
async def verify_wallet(body: VerifyWalletRequest):
    """
    Accept a wallet address (+ optional role) and return a JWT.
    Creates the user document if first time; always updates role when provided.

    NOTE: In production, verify a signed Algorand message here.
          For the hackathon on TestNet this is sufficient.
    """
    db   = get_db()
    role = body.role or "farmer"

    # Upsert: always update role when explicitly provided
    now  = datetime.now(timezone.utc)
    user = await db.users.find_one_and_update(
        {"wallet_address": body.wallet_address},
        {
            "$set":         {"role": role, "updated_at": now},
            "$setOnInsert": {"wallet_address": body.wallet_address,
                             "name": "", "phone": "", "location": "",
                             "trades_completed": 0, "total_earned_algo": 0.0,
                             "created_at": now},
        },
        upsert=True,
        return_document=True,
    )

    # Sanitise _id for JSON serialisation
    user["_id"] = str(user["_id"])

    token = create_token(user["wallet_address"], user["role"])
    return ApiResponse(success=True, data={"token": token, "user": user})
