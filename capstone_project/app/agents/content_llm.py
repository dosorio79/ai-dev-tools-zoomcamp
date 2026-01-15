from typing import List

from pydantic_ai import Agent

from app.core.config import MODEL
from app.models.agents import PlannedSection, GeneratedSection, ContentBlock
from app.agents.content_llm_models import LLMLessonModel


class ContentAgentLLM:
    """
    LLM-backed content agent.
    Generates structured lesson blocks using an LLM.
    """

    def __init__(self) -> None:
        self.agent = Agent(
            model=MODEL,
            result_type=LLMLessonModel,
            system_prompt=(
                "You are an expert instructor. "
                "Generate lesson content as structured blocks. "
                "Return only valid JSON matching the provided schema."
            ),
        )

    def generate(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> List[GeneratedSection]:
        prompt = self._build_prompt(topic, planned_sections)
        result = self.agent.run(prompt)
        return self._parse_result(result.data)

    def _build_prompt(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> str:
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

    def _parse_result(
        self,
        lesson: LLMLessonModel,
    ) -> List[GeneratedSection]:
        """
        Convert validated LLM output into domain dataclasses.
        """
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
