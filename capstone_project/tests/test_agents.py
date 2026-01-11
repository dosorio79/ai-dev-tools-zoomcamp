# Unit tests for planner / validator
import pytest

from app.agents.validator import ValidatorAgent
from app.models.agents import GeneratedSection


def test_validator_adjusts_minutes_to_target_total():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="intro",
            title="Intro",
            minutes=5,
            content_markdown="Intro content",
        ),
        GeneratedSection(
            id="deep-dive",
            title="Deep dive",
            minutes=5,
            content_markdown="Deep dive content",
        ),
    ]

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["intro", "deep-dive"]


def test_validator_rounds_minutes_with_multiple_sections():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="intro",
            title="Intro",
            minutes=3,
            content_markdown="Intro content",
        ),
        GeneratedSection(
            id="core",
            title="Core",
            minutes=7,
            content_markdown="Core content",
        ),
        GeneratedSection(
            id="wrap",
            title="Wrap",
            minutes=10,
            content_markdown="Wrap content",
        ),
    ]

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["intro", "core", "wrap"]


def test_validator_requires_non_empty_content():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="intro",
            title="Intro",
            minutes=5,
            content_markdown="   ",
        )
    ]

    with pytest.raises(ValueError, match="content"):
        validator.validate(sections)


def test_validator_requires_minimum_minutes():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="intro",
            title="Intro",
            minutes=2,
            content_markdown="Intro content",
        )
    ]

    with pytest.raises(ValueError, match="minutes"):
        validator.validate(sections)


def test_validator_requires_at_least_one_section():
    validator = ValidatorAgent()

    with pytest.raises(ValueError, match="at least one section"):
        validator.validate([])


def test_validator_requires_unique_section_ids():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="intro",
            title="Intro",
            minutes=5,
            content_markdown="Intro content",
        ),
        GeneratedSection(
            id="intro",
            title="Intro duplicate",
            minutes=5,
            content_markdown="More content",
        ),
    ]

    with pytest.raises(ValueError, match="unique"):
        validator.validate(sections)
