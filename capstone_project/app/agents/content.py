"""Content agent that expands planned sections into Markdown."""

from typing import List

from app.models.agents import GeneratedSection, PlannedSection
    
class ContentAgent:
    """Generates section content for a lesson plan."""
    def generate(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> List[GeneratedSection]:
        """Return sections populated with Markdown content."""
        generated_sections: List[GeneratedSection] = []

        for section in planned_sections:
            generated_sections.append(
                GeneratedSection(
                    id=section.id,
                    title=section.title,
                    minutes=section.minutes,
                    content_markdown="This section explains the core idea.",
                )
            )

        return generated_sections
