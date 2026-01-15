# Unit tests for validator and LLM content parsing
import importlib
import sys
import types

import pytest

from app.agents.validator import ValidatorAgent
from app.models.agents import ContentBlock, GeneratedSection
from app.agents.content_llm_models import LLMLessonModel


def _load_content_llm():
    try:
        return importlib.import_module("app.agents.content_llm")
    except ModuleNotFoundError as exc:
        if exc.name != "pydantic_ai":
            raise
        dummy = types.ModuleType("pydantic_ai")

        class Agent:
            def __init__(self, *args, **kwargs) -> None:
                pass

        dummy.Agent = Agent
        sys.modules["pydantic_ai"] = dummy
        return importlib.import_module("app.agents.content_llm")


# ValidatorAgent tests
@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
def test_validator_requires_at_least_one_section():
    validator = ValidatorAgent()

    with pytest.raises(ValueError, match="at least one section"):
        validator.validate([])


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


@pytest.mark.unit
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


# ContentAgentLLM parsing tests
@pytest.mark.llm
def test_content_llm_parse_result_accepts_dict():
    content_llm = _load_content_llm()
    agent = content_llm.ContentAgentLLM.__new__(content_llm.ContentAgentLLM)
    payload = {
        "sections": [
            {
                "id": "concept",
                "title": "Core concept",
                "minutes": 7,
                "blocks": [
                    {"type": "text", "content": "Intro content."},
                    {"type": "python", "content": "print('hello')"},
                ],
            }
        ]
    }

    sections = agent._parse_result(payload)

    assert len(sections) == 1
    assert sections[0].id == "concept"
    assert sections[0].blocks[1].type == "python"


@pytest.mark.llm
def test_content_llm_parse_result_accepts_model():
    content_llm = _load_content_llm()
    agent = content_llm.ContentAgentLLM.__new__(content_llm.ContentAgentLLM)
    payload = {
        "sections": [
            {
                "id": "example",
                "title": "Worked example",
                "minutes": 8,
                "blocks": [
                    {"type": "text", "content": "Example content."},
                    {"type": "python", "content": "print('ok')"},
                ],
            }
        ]
    }
    model = LLMLessonModel.model_validate(payload)

    sections = agent._parse_result(model)

    assert len(sections) == 1
    assert sections[0].id == "example"
    assert sections[0].blocks[0].content == "Example content."
