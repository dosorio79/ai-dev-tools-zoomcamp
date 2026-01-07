from fastapi import APIRouter

from app.models.api import LessonRequest, LessonResponse
from app.services.lesson_service import generate_lesson

router = APIRouter(prefix="/lesson", tags=["Lessons"])


@router.post("/", response_model=LessonResponse)
async def create_lesson(request: LessonRequest) -> LessonResponse:
    return generate_lesson(request)
        
