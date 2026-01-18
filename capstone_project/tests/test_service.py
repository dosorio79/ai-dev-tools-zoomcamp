# Lesson orchestration tests
import asyncio
from datetime import datetime, timezone
from unittest.mock import Mock

import pytest

from pydantic import BaseModel, ValidationError

from app.models.agents import ContentBlock, GeneratedSection
from app.models.api import LessonRequest
from app.models.db import LessonRun
from app.services import lesson_service
from app.services.lesson_service import generate_lesson

pytestmark = pytest.mark.unit


def test_generate_lesson_returns_expected_structure():
    request = LessonRequest(
        session_id="5c05c610-1d1a-4b3d-8b66-9c7b8c4d6c2f",
        topic="vector databases",
        level="beginner",
    )

    import asyncio

    response = asyncio.run(generate_lesson(request))

    assert response.total_minutes == 15
    assert response.objective == "Learn vector databases at a beginner level in 15 minutes."
    assert response.sections
    assert sum(section.minutes for section in response.sections) == 15
    assert response.sections[0].id == "concept"
    assert response.sections[0].title == "Core concept"
    assert response.sections[0].content_markdown == (
        "This section introduces the key ideas behind vector databases.\n\n"
        "- Define the core concept in one sentence.\n"
        "- Highlight a common use case.\n\n"
        "1. Identify the goal.\n"
        "2. Apply the technique with a small example."
    )

    exercise_sections = [section for section in response.sections if section.id == "exercise"]
    assert exercise_sections, "Expected an exercise section."
    assert ":::exercise\n" in exercise_sections[0].content_markdown
    assert "\n:::" in exercise_sections[0].content_markdown


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


def test_lesson_run_validation_accepts_valid_payload():
    lesson_run = LessonRun(
        run_id="run-456",
        session_id="session-456",
        topic="vector databases",
        level="beginner",
        created_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
        total_minutes=15,
        objective="Learn vector databases at a beginner level in 15 minutes.",
        section_ids=["concept"],
    )

    assert lesson_run.run_id == "run-456"
    assert lesson_run.level == "beginner"


def _make_validation_error() -> ValidationError:
    class DummyModel(BaseModel):
        value: int

    try:
        DummyModel.model_validate({"value": "invalid"})
    except ValidationError as exc:
        return exc
    raise AssertionError("Expected ValidationError to be raised.")


def test_generate_lesson_persists_schema_failure(monkeypatch):
    request = LessonRequest(
        session_id="e8f94f79-30b7-49a6-8d59-8d6061a36b55",
        topic="vector databases",
        level="beginner",
    )
    validation_error = _make_validation_error()

    class DummyPlanner:
        def plan(self, topic: str, level: str):
            return []

    class DummyContent:
        def __init__(self, exc: ValidationError):
            self.exc = exc

        async def generate(self, topic: str, planned_sections):
            raise self.exc

    class DummyValidator:
        def validate(self, sections):
            return sections

    insert_failure = Mock()

    monkeypatch.setattr(lesson_service, "planner_agent", DummyPlanner())
    monkeypatch.setattr(lesson_service, "content_agent", DummyContent(validation_error))
    monkeypatch.setattr(lesson_service, "validator_agent", DummyValidator())
    monkeypatch.setattr(lesson_service, "insert_lesson_failure", insert_failure)

    with pytest.raises(ValidationError):
        asyncio.run(lesson_service.generate_lesson(request))

    assert insert_failure.called
    failure_doc = insert_failure.call_args[0][0]
    assert failure_doc["error_type"] == "schema_validation"
    assert failure_doc["topic"] == request.topic


def test_generate_lesson_persists_content_failure(monkeypatch):
    request = LessonRequest(
        session_id="7b42e7f6-2cd4-43fd-b9bc-8b0d6d40b9f2",
        topic="vector databases",
        level="beginner",
    )

    class DummyPlanner:
        def plan(self, topic: str, level: str):
            return []

    class DummyContent:
        async def generate(self, topic: str, planned_sections):
            return [
                GeneratedSection(
                    id="concept",
                    title="Concept",
                    minutes=5,
                    blocks=[ContentBlock(type="text", content="Paragraph.\n\n- bullet")],
                ),
                GeneratedSection(
                    id="example",
                    title="Example",
                    minutes=5,
                    blocks=[ContentBlock(type="text", content="Paragraph.\n\n- bullet")],
                ),
                GeneratedSection(
                    id="exercise",
                    title="Exercise",
                    minutes=5,
                    blocks=[ContentBlock(type="exercise", content="Do the thing.")],
                ),
            ]

    class DummyValidator:
        def validate(self, sections):
            raise ValueError("Bad python block")

    insert_failure = Mock()

    monkeypatch.setattr(lesson_service, "planner_agent", DummyPlanner())
    monkeypatch.setattr(lesson_service, "content_agent", DummyContent())
    monkeypatch.setattr(lesson_service, "validator_agent", DummyValidator())
    monkeypatch.setattr(lesson_service, "insert_lesson_failure", insert_failure)

    with pytest.raises(ValueError):
        asyncio.run(lesson_service.generate_lesson(request))

    assert insert_failure.called
    failure_doc = insert_failure.call_args[0][0]
    assert failure_doc["error_type"] == "content_validation"
    assert failure_doc["topic"] == request.topic
