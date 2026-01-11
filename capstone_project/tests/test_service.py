# Lesson orchestration tests
import pytest

from pydantic import ValidationError

from app.models.api import LessonRequest
from app.models.db import LessonRun
from app.services.lesson_service import generate_lesson


def test_generate_lesson_returns_expected_structure():
    request = LessonRequest(
        session_id="5c05c610-1d1a-4b3d-8b66-9c7b8c4d6c2f",
        topic="vector databases",
        level="beginner",
    )

    response = generate_lesson(request)

    assert response.total_minutes == 15
    assert response.objective == "Learn vector databases at a beginner level in 15 minutes."
    assert response.sections
    assert sum(section.minutes for section in response.sections) == 15
    assert response.sections[0].id == "concept"
    assert response.sections[0].title == "Core concept"
    assert response.sections[0].content_markdown == "This section explains the core idea."


def test_lesson_run_validation_rejects_invalid_level():
    with pytest.raises(ValidationError):
        LessonRun(
            run_id="run-123",
            session_id="session-123",
            topic="vector databases",
            level="expert",
            created_at="2024-01-01T00:00:00Z",
            total_minutes=15,
            objective="Learn vector databases at a beginner level in 15 minutes.",
            section_ids=["concept"],
        )
