"""Agent-level dataclasses shared across planner/content/validator."""

from dataclasses import dataclass

__all__ = ["PlannedSection", "GeneratedSection"]


@dataclass
class PlannedSection:
    """Planned section output from the planner agent."""
    id: str
    title: str
    minutes: int


@dataclass
class GeneratedSection:
    """Generated section output with content from the content agent."""
    id: str
    title: str
    minutes: int
    content_markdown: str
