"""Content agent that expands planned sections into structured blocks."""

from typing import List

from app.models.agents import PlannedSection, GeneratedSection, ContentBlock


class ContentAgent:
    """Generates structured lesson content blocks."""

    def _format_text_block(self, topic: str) -> str:
        return (
            f"This section introduces the key ideas behind {topic}.\n\n"
            "- Define the core concept in one sentence.\n"
            "- Highlight a common use case.\n\n"
            "1. Identify the goal.\n"
            "2. Apply the technique with a small example."
        )

    async def generate(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> List[GeneratedSection]:
        generated_sections: List[GeneratedSection] = []

        for section in planned_sections:
            blocks: list[ContentBlock] = []

            # Base explanatory text (always present)
            blocks.append(
                ContentBlock(
                    type="text",
                    content=self._format_text_block(topic),
                )
            )

            # Example section: include minimal runnable Python
            if section.id == "example":
                blocks.append(
                    ContentBlock(
                        type="python",
                        content=(
                            "import pandas as pd\n\n"
                            "df = pd.DataFrame({\n"
                            "    'group': ['A', 'B', 'A'],\n"
                            "    'value': [10, 20, 30]\n"
                            "})\n\n"
                            "result = df.groupby('group')['value'].sum()\n"
                            "print(result)"
                        ),
                    )
                )

            # Exercise section: explicit exercise block
            if section.id == "exercise":
                blocks.append(
                    ContentBlock(
                        type="exercise",
                        content=(
                            f"Create a small dataset related to '{topic}' and "
                            "apply the concepts from this lesson."
                        ),
                    )
                )

            generated_sections.append(
                GeneratedSection(
                    id=section.id,
                    title=section.title,
                    minutes=section.minutes,
                    blocks=blocks,
                )
            )

        return generated_sections
