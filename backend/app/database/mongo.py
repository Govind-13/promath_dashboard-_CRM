from datetime import datetime, timezone

from backend.app.config.settings import (
    MONGO_AUDIT_COLLECTION,
    MONGO_DB,
    MONGO_STORAGE_COLLECTION,
    MONGO_URI,
)


class MongoDatabase:
    def __init__(self):
        from pymongo import ASCENDING, MongoClient

        self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        self.db = self.client[MONGO_DB]
        self.storage = self.db[MONGO_STORAGE_COLLECTION]
        self.audit = self.db[MONGO_AUDIT_COLLECTION]
        self.storage.create_index([("key", ASCENDING)], unique=True)
        self.audit.create_index([("storage_key", ASCENDING), ("created_at", ASCENDING)])

    def ping(self):
        self.client.admin.command("ping")

    @staticmethod
    def now():
        return datetime.now(timezone.utc).isoformat()
