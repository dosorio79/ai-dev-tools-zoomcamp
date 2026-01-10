from fastapi import FastAPI
from app.api import lesson
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="uLearn API",
    version="0.1.0",
    description="Backend API for the uLearn micro-learning platform",
)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

app.include_router(lesson.router)
