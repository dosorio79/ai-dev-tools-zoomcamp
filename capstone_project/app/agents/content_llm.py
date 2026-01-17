import inspect
import json
from pathlib import Path
from typing import Any, List

from pydantic_ai import Agent

from app.core.config import MODEL
from app.models.agents import PlannedSection, GeneratedSection, ContentBlock
from app.agents.content_llm_models import LLMLessonModel

PROMPT_PATH = Path(__file__).resolve().parent / "prompts" / "content_llm_system.txt"
USER_PROMPT_PATH = Path(__file__).resolve().parent / "prompts" / "content_llm_user.txt"


class ContentAgentLLM:
    """
    LLM-backed content agent.

    Responsibilities:
    - Call the LLM with a strict prompt
    - Parse JSON output
    - Validate against LLMLessonModel
    - Convert to internal GeneratedSection dataclasses

    This agent does NOT:
    - Normalize shapes
    - Guess keys
    - Repair malformed outputs
    """

    def __init__(self) -> None:
        system_prompt = PROMPT_PATH.read_text(encoding="utf-8").strip()
        self.agent = Agent(
            model=MODEL,
            system_prompt=system_prompt,
        )

    async def generate(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> List[GeneratedSection]:
        prompt = self._build_prompt(topic, planned_sections)

        result = self.agent.run(prompt)
        if inspect.isawaitable(result):
            result = await result

        lesson = self._parse_llm_result(result)
        return self._to_generated_sections(lesson)

    def _build_prompt(self, topic: str, planned_sections: List[PlannedSection]) -> str:
        sections_desc = "\n".join(
            f"- id: {s.id}, title: {s.title}, minutes: {s.minutes}"
            for s in planned_sections
        )

        template = USER_PROMPT_PATH.read_text(encoding="utf-8")
        return template.format(
            topic=topic,
            sections_desc=sections_desc,
        ).strip()

    def _parse_llm_result(self, result: Any) -> LLMLessonModel:
        """
        Extract and strictly validate the LLM output.

        Any schema mismatch is treated as an error and must
        be fixed via prompt iteration, not coercion.
        """
        data = getattr(result, "data", None)
        if data is None:
            data = getattr(result, "output", result)

        if isinstance(data, LLMLessonModel):
            return data

        if isinstance(data, str):
            data = json.loads(self._strip_code_fences(data))

        # Hard boundary: must match the declared schema
        return LLMLessonModel.model_validate(data)

    def _to_generated_sections(
        self,
        lesson: LLMLessonModel,
    ) -> List[GeneratedSection]:
        return [
            GeneratedSection(
                id=section.id,
                title=section.title,
                minutes=section.minutes,
                blocks=[
                    ContentBlock(
                        type=block.type,
                        content=block.content,
                    )
                    for block in section.blocks
                ],
            )
            for section in lesson.sections
        ]

    def _strip_code_fences(self, text: str) -> str:
        """
        Remove surrounding ```json / ``` fences if present.
        """
        stripped = text.strip()
        if stripped.startswith("```"):
            lines = stripped.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            stripped = "\n".join(lines).strip()
        return stripped
