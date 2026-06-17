from backend.app.database.mongo import MongoDatabase


class StorageRepository:
    def __init__(self, database: MongoDatabase):
        self.database = database

    def get(self, key: str):
        return self.database.storage.find_one({"key": key}, {"_id": 0})

    def set(self, key: str, value: str):
        now = self.database.now()
        self.database.storage.update_one(
            {"key": key},
            {
                "$set": {"key": key, "value": value, "updated_at": now},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        self.database.audit.insert_one(
            {"storage_key": key, "action": "upsert", "created_at": now}
        )
