# API + MongoDB integration tests
from datetime import datetime, timezone
from uuid import uuid4

from app.models.api import LessonRequest
from app.services.lesson_service import generate_lesson
from app.services.mongo import get_collection

import pytest

pytest.skip("Integration test: requires MongoDB running in Docker", allow_module_level=True)

def test_generate_lesson_inserts_telemetry_document():
    session_id = str(uuid4())
    request = LessonRequest(
        session_id=session_id,
        topic="telemetry testing",
        level="beginner",
    )

    collection = get_collection()
    start_time = datetime.now(timezone.utc)
    before_count = collection.count_documents(
        {"session_id": session_id, "topic": "telemetry testing"}
    )

    generate_lesson(request)

    after_count = collection.count_documents(
        {
            "session_id": session_id,
            "topic": "telemetry testing",
            "created_at": {"$gte": start_time},
        }
    )

    assert after_count == before_count + 1
