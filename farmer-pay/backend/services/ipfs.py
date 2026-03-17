"""
ipfs.py — delivery proof photo upload via Pinata IPFS.
Returns the IPFS CID stored in MongoDB and displayed in the UI.
"""

import httpx
from config import settings

PINATA_URL     = "https://api.pinata.cloud/pinning/pinFileToIPFS"
IPFS_GATEWAY   = "https://gateway.pinata.cloud/ipfs"


async def upload(file_bytes: bytes, filename: str, trade_id: str) -> str:
    """
    Upload file_bytes to IPFS via Pinata.
    Returns the CID string (e.g. 'QmXyz...').
    """
    if not settings.pinata_api_key or not settings.pinata_secret:
        raise ValueError("PINATA_API_KEY and PINATA_SECRET must be set in .env")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            PINATA_URL,
            headers={
                "pinata_api_key":        settings.pinata_api_key,
                "pinata_secret_api_key": settings.pinata_secret,
            },
            files={"file": (filename, file_bytes)},
            data={
                "pinataMetadata": f'{{"name": "FarmPay Delivery Proof — {trade_id}"}}'
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["IpfsHash"]


def gateway_url(cid: str) -> str | None:
    return f"{IPFS_GATEWAY}/{cid}" if cid else None
