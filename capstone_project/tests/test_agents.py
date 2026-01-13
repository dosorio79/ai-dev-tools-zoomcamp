# Unit tests for planner / validator
import pytest

from app.agents.validator import ValidatorAgent
from app.models.agents import ContentBlock, GeneratedSection


def test_validator_adjusts_minutes_to_target_total():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Core concept",
            minutes=5,
            blocks=[
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="example",
            title="Worked example",
            minutes=5,
            blocks=[ContentBlock(type="text", content="Deep dive content")],
        ),
    ]

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["concept", "example"]


def test_validator_rounds_minutes_with_multiple_sections():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Core concept",
            minutes=3,
            blocks=[
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="example",
            title="Worked example",
            minutes=7,
            blocks=[ContentBlock(type="text", content="Core content")],
        ),
        GeneratedSection(
            id="exercise",
            title="Practice task",
            minutes=10,
            blocks=[ContentBlock(type="text", content="Wrap content")],
        ),
    ]

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["concept", "example", "exercise"]


def test_validator_requires_non_empty_content():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Intro",
            minutes=5,
            blocks=[ContentBlock(type="text", content="   ")],
        )
    ]

    with pytest.raises(ValueError, match="content"):
        validator.validate(sections)


def test_validator_requires_minimum_minutes():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Intro",
            minutes=2,
            blocks=[
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
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
            id="concept",
            title="Intro",
            minutes=5,
            blocks=[
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="concept",
            title="Concept duplicate",
            minutes=5,
            blocks=[ContentBlock(type="text", content="More content")],
        ),
    ]

    with pytest.raises(ValueError, match="unique"):
        validator.validate(sections)


def test_validator_rejects_invalid_section_ids():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="overview",
            title="Overview",
            minutes=15,
            blocks=[
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        )
    ]

    with pytest.raises(ValueError, match="Section IDs must be one of"):
        validator.validate(sections)


def test_validator_rejects_too_many_sections():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Concept",
            minutes=4,
            blocks=[
                ContentBlock(type="text", content="Concept content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="example",
            title="Example",
            minutes=4,
            blocks=[ContentBlock(type="text", content="Example content")],
        ),
        GeneratedSection(
            id="exercise",
            title="Exercise",
            minutes=4,
            blocks=[ContentBlock(type="text", content="Exercise content")],
        ),
        GeneratedSection(
            id="concept",
            title="Extra concept",
            minutes=4,
            blocks=[ContentBlock(type="text", content="Extra content")],
        ),
    ]

    with pytest.raises(ValueError, match="sections"):
        validator.validate(sections)


def test_validator_requires_python_block_across_lesson():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Concept",
            minutes=15,
            blocks=[ContentBlock(type="text", content="Concept content only.")],
        )
    ]

    with pytest.raises(ValueError, match="python block"):
        validator.validate(sections)


def test_validator_rejects_invalid_block_type():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Concept",
            minutes=15,
            blocks=[ContentBlock(type="javascript", content="console.log('hi')")],
        )
    ]

    with pytest.raises(ValueError, match="Block type must be"):
        validator.validate(sections)


def test_validator_rejects_invalid_python_syntax():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Concept",
            minutes=15,
            blocks=[ContentBlock(type="python", content="print('missing paren'")],
        )
    ]

    with pytest.raises(ValueError, match="valid syntax"):
        validator.validate(sections)


def test_validator_strict_minutes_requires_exact_total():
    validator = ValidatorAgent()
    sections = [
        GeneratedSection(
            id="concept",
            title="Concept",
            minutes=10,
            blocks=[
                ContentBlock(type="text", content="Concept content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="example",
            title="Example",
            minutes=4,
            blocks=[ContentBlock(type="text", content="Example content")],
        ),
    ]

    with pytest.raises(ValueError, match="Total lesson duration must equal 15 minutes"):
        validator.validate(sections, strict_minutes=True)


def test_validator_json_only_response_rejects_extra_keys():
    validator = ValidatorAgent()
    payload = {
        "objective": "Learn pandas groupby performance.",
        "sections": [
            {
                "id": "concept",
                "title": "Core concept",
                "minutes": 5,
                "blocks": [
                    {"type": "text", "content": "Explain concept."}
                ],
            }
        ],
        "extra": "nope",
    }

    with pytest.raises(ValueError, match="extra keys"):
        validator.validate_json_only_response(payload)
