"""Validator agent for lesson structure and content rules."""

import ast
from typing import Dict, List

from app.models.agents import GeneratedSection, ContentBlock


class ValidatorAgent:
    """
    Validates generated lesson sections before rendering and delivery.
    """
    # Constants
    TARGET_TOTAL_MINUTES = 15
    MIN_SECTION_MINUTES = 3
    MIN_SECTION_COUNT = 1
    MAX_SECTION_COUNT = 3

    ALLOWED_SECTION_IDS = {"concept", "example", "exercise"}
    ALLOWED_BLOCK_TYPES = {"text", "python", "exercise"}
    MAX_PYTHON_LINES = 30
    JSON_LESSON_KEYS = {"objective", "sections"}
    JSON_SECTION_KEYS = {"id", "title", "minutes", "blocks"}
    JSON_BLOCK_KEYS = {"type", "content"}

    def validate(
        self,
        sections: List[GeneratedSection],
        *,
        strict_minutes: bool = False,
    ) -> List[GeneratedSection]:
        # Structural checks
        if not sections:
            raise ValueError("Lesson must include at least one section.")

        if not (self.MIN_SECTION_COUNT <= len(sections) <= self.MAX_SECTION_COUNT):
            raise ValueError(
                f"Lesson must include {self.MIN_SECTION_COUNT}-{self.MAX_SECTION_COUNT} sections."
            )

        section_ids = [section.id for section in sections]
        if len(set(section_ids)) != len(section_ids):
            raise ValueError("Section IDs must be unique.")

        if any(section.id not in self.ALLOWED_SECTION_IDS for section in sections):
            raise ValueError(
                f"Section IDs must be one of {sorted(self.ALLOWED_SECTION_IDS)}."
            )

        python_block_found = False

        # Per-section checks
        for section in sections:
            if section.minutes < self.MIN_SECTION_MINUTES:
                raise ValueError(
                    f"Section '{section.id}' must be at least {self.MIN_SECTION_MINUTES} minutes."
                )

            if not section.blocks:
                raise ValueError(f"Section '{section.id}' must include at least one block.")

            for block in section.blocks:
                self._validate_block(block)
                if block.type == "python":
                    python_block_found = True

        if not python_block_found:
            raise ValueError("Lesson must include at least one python block.")

        # Time validation
        total_minutes = sum(section.minutes for section in sections)

        if strict_minutes and total_minutes != self.TARGET_TOTAL_MINUTES:
            raise ValueError("Total lesson duration must equal 15 minutes.")

        if total_minutes == self.TARGET_TOTAL_MINUTES:
            return sections

        # Ensure the minimum minutes constraint is feasible before scaling
        if self.MIN_SECTION_MINUTES * len(sections) > self.TARGET_TOTAL_MINUTES:
            raise ValueError("Minimum section length exceeds total lesson time.")

        adjustment_factor = self.TARGET_TOTAL_MINUTES / total_minutes
        adjusted_sections = []
        accumulated_minutes = 0

        for i, section in enumerate(sections):
            if i == len(sections) - 1:
                adjusted_minutes = self.TARGET_TOTAL_MINUTES - accumulated_minutes
            else:
                adjusted_minutes = max(
                    self.MIN_SECTION_MINUTES,
                    round(section.minutes * adjustment_factor),
                )
                accumulated_minutes += adjusted_minutes
            if i == len(sections) - 1 and adjusted_minutes < self.MIN_SECTION_MINUTES:
                raise ValueError("Minimum section length exceeds total lesson time.")
            adjusted_sections.append(
                GeneratedSection(
                    id=section.id,
                    title=section.title,
                    minutes=adjusted_minutes,
                    blocks=section.blocks,
                )
            )

        return adjusted_sections

    def validate_json_only_response(self, payload: Dict) -> None:
        """Validate a JSON-only lesson response with strict keys."""
        if not isinstance(payload, dict):
            raise ValueError("Lesson payload must be a JSON object.")
        if set(payload.keys()) != self.JSON_LESSON_KEYS:
            raise ValueError("Lesson JSON must not include extra keys.")

        sections = payload.get("sections")
        if not isinstance(sections, list):
            raise ValueError("Lesson sections must be a list.")

        for section in sections:
            if not isinstance(section, dict):
                raise ValueError("Lesson section must be a JSON object.")
            if set(section.keys()) != self.JSON_SECTION_KEYS:
                raise ValueError("Section JSON must not include extra keys.")
            blocks = section.get("blocks")
            if not isinstance(blocks, list) or not blocks:
                raise ValueError("Section must include at least one block.")
            for block in blocks:
                if not isinstance(block, dict):
                    raise ValueError("Block must be a JSON object.")
                if set(block.keys()) != self.JSON_BLOCK_KEYS:
                    raise ValueError("Block JSON must not include extra keys.")
                if block.get("type") not in {"text", "python", "exercise"}:
                    raise ValueError("Block type must be text, python, or exercise.")
                if not block.get("content"):
                    raise ValueError("Block content must be non-empty.")

    def _validate_block(self, block: ContentBlock) -> None:
        if block.type not in self.ALLOWED_BLOCK_TYPES:
            raise ValueError(
                f"Block type must be one of {sorted(self.ALLOWED_BLOCK_TYPES)}."
            )

        if not block.content or not block.content.strip():
            raise ValueError("Block content must be non-empty.")

        if block.type == "python":
            self._validate_python_block(block.content)

    def _validate_python_block(self, code: str) -> None:
        try:
            ast.parse(code)
        except SyntaxError as exc:
            raise ValueError("Python block must contain valid syntax.") from exc

        lines = [line for line in code.splitlines() if line.strip()]
        if len(lines) > self.MAX_PYTHON_LINES:
            raise ValueError("Python block must be minimal.")
