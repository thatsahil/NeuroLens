import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("neurolens.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
        db.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
        db.db = db.client[settings.DATABASE_NAME]
        # Verify connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")
        
        # Create indexes
        await db.db.users.create_index("email", unique=True)
        await db.db.patients.create_index("name")
        await db.db.predictions.create_index("patient_id")
        await db.db.predictions.create_index("created_at")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Application running with fallback handling.")

async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db.db
