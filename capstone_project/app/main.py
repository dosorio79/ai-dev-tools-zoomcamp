"""FastAPI application entrypoint."""

from fastapi import FastAPI

from app.api import lesson
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="uLearn API",
    version="0.1.0",
    description="Backend API for the uLearn micro-learning platform",
)

@app.get("/health", tags=["Health"])
async def health_check():
    """Return a simple health indicator."""
    return {"status": "healthy"}

app.include_router(lesson.router)
