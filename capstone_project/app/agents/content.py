# ContentAgent → fills content
from dataclasses import dataclass
from typing import List

@dataclass
class GeneratedSection:
    id: str
    title: str
    minutes: int
    content_markdown: str
    
class ContentAgent:
    def generate(self, topic: str, planned_sections: List) -> List[GeneratedSection]:
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
