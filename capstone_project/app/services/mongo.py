from __future__ import annotations

from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection

from app.core import config

# Global variable to hold the MongoDB client instance
_client: MongoClient | None = None

# Singleton pattern for MongoDB client
def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(config.MONGO_URI)
    return _client

# Get a specific collection from the database
def get_collection() -> Collection[Any]:
    client = get_client()
    db = client[config.MONGO_DB_NAME]
    return db[config.MONGO_COLLECTION]

# Insert a document into the lesson_runs collection
def insert_lesson_run(doc: dict) -> None:
    col = get_collection()
    col.insert_one(doc)
