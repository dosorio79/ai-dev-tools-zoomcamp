"""API routes for lesson generation."""

from fastapi import APIRouter

from app.models.api import LessonRequest, LessonResponse
from app.services.lesson_service import generate_lesson

router = APIRouter(prefix="/lesson", tags=["Lessons"])


@router.post("", response_model=LessonResponse)
async def create_lesson(request: LessonRequest) -> LessonResponse:
    """Generate a lesson response for the given request."""
    return await generate_lesson(request)
