from dataclasses import dataclass


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
