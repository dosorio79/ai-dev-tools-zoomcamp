# ValidatorAgent → checks consistency and safety

from typing import List

from app.models.agents import GeneratedSection

class ValidatorAgent:
    """
    Validates a generated lesson before it is returned.

    Current responsibilities:
    - Ensure total duration equals 15 minutes
    """
    
    TARGET_TOTAL_MINUTES = 15

    def validate(self, sections: List[GeneratedSection]) -> List[GeneratedSection]:
        total_minutes = sum(section.minutes for section in sections)
        if total_minutes == self.TARGET_TOTAL_MINUTES:
            return sections
        
        # Adjust sections to meet the target total minutes
        adjustment_factor = self.TARGET_TOTAL_MINUTES / total_minutes
        
        adjusted_sections = []
        accumulated_minutes = 0

        for i, section in enumerate(sections):
            if i == len(sections) - 1:
                # Assign remaining minutes to last section to avoid rounding issues
                adjusted_minutes = self.TARGET_TOTAL_MINUTES - accumulated_minutes
            else:
                adjusted_minutes = max(
                    1,
                    round(section.minutes * adjustment_factor),
                )
                accumulated_minutes += adjusted_minutes
            # Create a new GeneratedSection with adjusted minutes
            adjusted_section = section.__class__(
                id=section.id,
                title=section.title,
                minutes=adjusted_minutes,
                content_markdown=section.content_markdown,
            )
            adjusted_sections.append(adjusted_section)

        return adjusted_sections
    
        # In the future, this could check:
        # - section ordering
        # - content quality
        # - safety constraints
