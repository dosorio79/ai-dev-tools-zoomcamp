# Unit tests for planner / validator
from app.agents.validator import ValidatorAgent
from app.models.api import LessonSection


def test_validator_adjusts_minutes_to_target_total():
    validator = ValidatorAgent()
    sections = [
        LessonSection(
            id="intro",
            title="Intro",
            minutes=5,
            content_markdown="Intro content",
        ),
        LessonSection(
            id="deep-dive",
            title="Deep dive",
            minutes=5,
            content_markdown="Deep dive content",
        ),
    ]

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["intro", "deep-dive"]
