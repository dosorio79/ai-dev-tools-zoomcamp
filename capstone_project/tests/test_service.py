# Lesson orchestration tests
from app.models.api import LessonRequest
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
    assert len(response.sections) == 1
    section = response.sections[0]
    assert section.id == "concept"
    assert section.title == "Core concept"
    assert section.minutes == 15
    assert section.content_markdown == "This section explains the core idea."
