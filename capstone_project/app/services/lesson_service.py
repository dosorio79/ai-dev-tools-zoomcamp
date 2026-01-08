from app.models.api import LessonRequest, LessonResponse, LessonSection

from datetime import datetime, timezone
from uuid import uuid4

from app.services.mongo import insert_lesson_run

def generate_lesson(request: LessonRequest) -> LessonResponse:
    session_id = str(request.session_id) if request.session_id else str(uuid4())
    # create response
    response = LessonResponse(
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
    # Log the lesson generation request and response to MongoDB
    telemetry = {
        "run_id": str(uuid4()),
        "session_id": session_id,
        "topic": request.topic,
        "level": request.level,
        "created_at": datetime.now(timezone.utc),
        "total_minutes": response.total_minutes,
        "objective": response.objective,
        "section_ids": [s.id for s in response.sections],
    }
    # Attempt to insert telemetry data into MongoDB
    try:
        insert_lesson_run(telemetry)
    except Exception:
        # Best-effort telemetry: do not break the API if Mongo is unavailable
        pass
    return response
