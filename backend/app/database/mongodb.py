from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings
from app.core.logger import logger

client: MongoClient | None = None
db: Database | None = None


def connect_to_mongo():
    global client, db

    try:
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB_NAME]

        client.admin.command("ping")

        logger.info("MongoDB Connected Successfully")

    except Exception as e:
        logger.error(f"MongoDB Connection Error: {e}")
        raise e


def close_mongo_connection():
    global client

    if client:
        client.close()
        logger.info("MongoDB Connection Closed")


def get_database():
    return db