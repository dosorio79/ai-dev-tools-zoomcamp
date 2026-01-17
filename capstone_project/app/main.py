"""FastAPI application entrypoint."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import lesson
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="uLearn API",
    version="0.2.0",
    description="Backend API for the uLearn micro-learning platform",
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
async def health_check():
    """Return a simple health indicator."""
    return {"status": "healthy"}

app.include_router(lesson.router)
