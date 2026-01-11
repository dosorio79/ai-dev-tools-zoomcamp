"""Validator agent for lesson structure and content rules."""

from typing import List

from app.models.agents import GeneratedSection

class ValidatorAgent:
    """
    Validates a generated lesson before it is returned.

    Current responsibilities:
    - Ensure total duration equals 15 minutes
    """
    
    TARGET_TOTAL_MINUTES = 15
    MIN_SECTION_MINUTES = 3

    def validate(self, sections: List[GeneratedSection]) -> List[GeneratedSection]:
        """Validate sections and normalize minutes to the target total."""
        # Guardrails: structural sanity checks
        if not sections:
            raise ValueError("Lesson must include at least one section.")

        section_ids = [section.id for section in sections]
        if len(set(section_ids)) != len(section_ids):
            raise ValueError("Section IDs must be unique.")

        # Content and minimum duration checks
        for section in sections:
            if not section.content_markdown or not section.content_markdown.strip():
                raise ValueError("Section content must be non-empty.")
            if section.minutes < self.MIN_SECTION_MINUTES:
                raise ValueError(
                    f"Section minutes must be at least {self.MIN_SECTION_MINUTES}."
                )

        total_minutes = sum(section.minutes for section in sections)
        if total_minutes == self.TARGET_TOTAL_MINUTES:
            return sections

        # Ensure the minimum minutes constraint is feasible before scaling
        if self.MIN_SECTION_MINUTES * len(sections) > self.TARGET_TOTAL_MINUTES:
            raise ValueError("Minimum section length exceeds total lesson time.")
        
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
                    self.MIN_SECTION_MINUTES,
                    round(section.minutes * adjustment_factor),
                )
                accumulated_minutes += adjusted_minutes
            if i == len(sections) - 1 and adjusted_minutes < self.MIN_SECTION_MINUTES:
                raise ValueError("Minimum section length exceeds total lesson time.")
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
