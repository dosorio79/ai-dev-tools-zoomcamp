from app.models.api import LessonRequest, LessonResponse, LessonSection


def generate_lesson(request: LessonRequest) -> LessonResponse:
    # add mongo db logging here in the future
    
    return LessonResponse(
        objective=f"Learn {request.topic} at a {request.level} level in 15 minutes.",
        total_minutes=15,
        sections=[
            LessonSection(
                id="concept",
                title="Core concept",
                minutes=6,
                content_markdown="This section explains the core idea.",
            )
        ],
    )

