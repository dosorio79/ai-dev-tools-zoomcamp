from dataclasses import dataclass

__all__ = ["PlannedSection", "GeneratedSection"]


@dataclass
class PlannedSection:
    id: str
    title: str
    minutes: int


@dataclass
class GeneratedSection:
    id: str
    title: str
    minutes: int
    content_markdown: str
