# Unit tests for validator and LLM content parsing
import importlib
import json
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


def _base_sections(
    *,
    concept_blocks: list[ContentBlock] | None = None,
    example_blocks: list[ContentBlock] | None = None,
    exercise_blocks: list[ContentBlock] | None = None,
    minutes: dict[str, int] | None = None,
) -> list[GeneratedSection]:
    default_minutes = {"concept": 5, "example": 6, "exercise": 4}
    minutes = minutes or default_minutes
    return [
        GeneratedSection(
            id="concept",
            title="Core concept",
            minutes=minutes["concept"],
            blocks=concept_blocks
            or [
                ContentBlock(type="text", content="Intro content."),
                ContentBlock(type="python", content="print('hello')"),
            ],
        ),
        GeneratedSection(
            id="example",
            title="Worked example",
            minutes=minutes["example"],
            blocks=example_blocks or [ContentBlock(type="text", content="Example content")],
        ),
        GeneratedSection(
            id="exercise",
            title="Exercise",
            minutes=minutes["exercise"],
            blocks=exercise_blocks
            or [ContentBlock(type="exercise", content="Exercise content")],
        ),
    ]


# ValidatorAgent tests
@pytest.mark.unit
def test_validator_adjusts_minutes_to_target_total():
    validator = ValidatorAgent()
    sections = _base_sections(
        minutes={"concept": 4, "example": 4, "exercise": 4},
        example_blocks=[ContentBlock(type="text", content="Deep dive content")],
    )

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["concept", "example", "exercise"]


@pytest.mark.unit
def test_validator_rounds_minutes_with_multiple_sections():
    validator = ValidatorAgent()
    sections = _base_sections(
        minutes={"concept": 3, "example": 7, "exercise": 10},
        example_blocks=[ContentBlock(type="text", content="Core content")],
        exercise_blocks=[ContentBlock(type="exercise", content="Wrap content")],
    )

    adjusted = validator.validate(sections)

    assert sum(section.minutes for section in adjusted) == validator.TARGET_TOTAL_MINUTES
    assert [section.id for section in adjusted] == ["concept", "example", "exercise"]


@pytest.mark.unit
def test_validator_requires_non_empty_content():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="text", content="   ")],
    )

    with pytest.raises(ValueError, match="content"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_requires_minimum_minutes():
    validator = ValidatorAgent()
    sections = _base_sections(
        minutes={"concept": 2, "example": 6, "exercise": 4},
    )

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
            minutes=6,
            blocks=[ContentBlock(type="text", content="More content")],
        ),
        GeneratedSection(
            id="exercise",
            title="Exercise",
            minutes=4,
            blocks=[ContentBlock(type="exercise", content="Exercise content")],
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
        ),
        GeneratedSection(
            id="example",
            title="Example",
            minutes=6,
            blocks=[ContentBlock(type="text", content="Example content")],
        ),
        GeneratedSection(
            id="exercise",
            title="Exercise",
            minutes=4,
            blocks=[ContentBlock(type="exercise", content="Exercise content")],
        ),
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
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="text", content="Concept content only.")],
        example_blocks=[ContentBlock(type="text", content="Example content only.")],
        exercise_blocks=[ContentBlock(type="exercise", content="Exercise content")],
    )

    with pytest.raises(ValueError, match="python block"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_rejects_invalid_block_type():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="javascript", content="console.log('hi')")],
    )

    with pytest.raises(ValueError, match="Block type must be"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_rejects_invalid_python_syntax():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="python", content="print('missing paren'")],
    )

    with pytest.raises(ValueError, match="valid syntax"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_rejects_exercise_markdown_fences():
    validator = ValidatorAgent()
    sections = _base_sections(
        exercise_blocks=[
            ContentBlock(
                type="exercise",
                content="```python\nprint('nope')\n```",
            )
        ],
    )

    with pytest.raises(ValueError, match="Exercise blocks must be plain text"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_requires_python_output():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="python", content="x = 1")],
    )

    with pytest.raises(ValueError, match="visible output"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_requires_python_imports():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[
            ContentBlock(
                type="python",
                content="df = pd.DataFrame({'a': [1]})\nprint(df)",
            )
        ],
    )

    with pytest.raises(ValueError, match="Missing import"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_allows_expression_output():
    validator = ValidatorAgent()
    sections = _base_sections(
        concept_blocks=[ContentBlock(type="python", content="2 + 2")],
    )

    with pytest.raises(ValueError, match="visible output"):
        validator.validate(sections)


@pytest.mark.unit
def test_validator_strict_minutes_requires_exact_total():
    validator = ValidatorAgent()
    sections = _base_sections(
        minutes={"concept": 10, "example": 4, "exercise": 4},
        concept_blocks=[
            ContentBlock(type="text", content="Concept content."),
            ContentBlock(type="python", content="print('hello')"),
        ],
    )

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


@pytest.mark.unit
def test_validator_json_only_response_requires_sections():
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
    }

    with pytest.raises(ValueError, match="concept, example, and exercise"):
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

    lesson = agent._parse_llm_result(payload)
    sections = agent._to_generated_sections(lesson)

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

    sections = agent._to_generated_sections(model)

    assert len(sections) == 1
    assert sections[0].id == "example"
    assert sections[0].blocks[0].content == "Example content."


@pytest.mark.llm
def test_content_llm_coerce_result_strips_code_fences_from_output():
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

    class DummyResult:
        output = f"```json\n{json.dumps(payload)}\n```"

    lesson = agent._parse_llm_result(DummyResult())

    assert lesson.sections[0].id == "concept"
