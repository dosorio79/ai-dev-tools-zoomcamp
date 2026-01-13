"""Agent-level dataclasses shared across planner, content, and validator."""

from dataclasses import dataclass
from typing import List, Literal

__all__ = ["PlannedSection", "ContentBlock", "GeneratedSection"]


@dataclass
class PlannedSection:
    """Planned section output from the planner agent."""
    id: str
    title: str
    minutes: int


BlockType = Literal["text", "python", "exercise"]


@dataclass
class ContentBlock:
    """Atomic content block produced by the content agent."""
    type: BlockType
    content: str


@dataclass
class GeneratedSection:
    """Generated section with structured content blocks."""
    id: str
    title: str
    minutes: int
    blocks: List[ContentBlock]
