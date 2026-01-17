import json
import inspect
from typing import Any, List
from pydantic_ai import Agent

from app.core.config import MODEL
from app.models.agents import PlannedSection, GeneratedSection, ContentBlock
from app.agents.content_llm_models import LLMLessonModel


class ContentAgentLLM:
    def __init__(self) -> None:
        self.agent = Agent(
            model=MODEL,
            system_prompt=(
                "You are an expert instructor. "
                "Generate lesson content as structured blocks. "
                "Return only valid JSON matching the provided schema."
            ),
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
        lesson = self._coerce_result(result)
        return self._parse_result(lesson)

    def _build_prompt(self, topic: str, planned_sections: List[PlannedSection]) -> str:
        sections_desc = "\n".join(
            f"- id: {s.id}, title: {s.title}, minutes: {s.minutes}"
            for s in planned_sections
        )

        return (
            f'Create a 15-minute lesson on "{topic}".\n\n'
            f"Sections:\n{sections_desc}\n\n"
            "Rules:\n"
            "- Use section ids exactly as provided\n"
            "- Return blocks with type: text | python | exercise\n"
            "- At least one python block\n"
            "- Python blocks must be runnable\n"
            "- Total minutes must remain unchanged\n\n"
            "Return JSON only."
        )

    def _parse_result(self, lesson: LLMLessonModel) -> List[GeneratedSection]:
        return [
            GeneratedSection(
                id=sec.id,
                title=sec.title,
                minutes=sec.minutes,
                blocks=[
                    ContentBlock(type=b.type, content=b.content)
                    for b in sec.blocks
                ],
            )
            for sec in lesson.sections
        ]

    def _coerce_result(self, result: Any) -> LLMLessonModel:
        data = getattr(result, "data", None)
        if data is None:
            data = getattr(result, "output", result)
        if isinstance(data, LLMLessonModel):
            return data
        if isinstance(data, str):
            payload = json.loads(self._strip_code_fences(data))
            return LLMLessonModel.model_validate(payload)
        return LLMLessonModel.model_validate(data)

    def _strip_code_fences(self, text: str) -> str:
        stripped = text.strip()
        if stripped.startswith("```"):
            lines = stripped.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            stripped = "\n".join(lines).strip()
        return stripped
