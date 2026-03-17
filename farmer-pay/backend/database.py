from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient | None = None


def get_db():
    """Return the farmerpay database handle. Call after startup."""
    return client["farmerpay"]


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.mongo_uri)
    # Verify connection
    await client.admin.command("ping")
    print("MongoDB connected")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB disconnected")
