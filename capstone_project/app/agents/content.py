from typing import List

from app.models.agents import GeneratedSection, PlannedSection
    
class ContentAgent:
    def generate(
        self,
        topic: str,
        planned_sections: List[PlannedSection],
    ) -> List[GeneratedSection]:
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
