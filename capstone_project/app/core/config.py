"""Environment-backed configuration settings."""
import os

# Database configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "ulearn")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "lesson_runs")
MONGO_FAILURE_COLLECTION = os.getenv("MONGO_FAILURE_COLLECTION", "lesson_failures")
MODEL = os.getenv("MODEL", "gpt-4.1-mini")
