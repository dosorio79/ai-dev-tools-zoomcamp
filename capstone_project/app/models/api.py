"""Pydantic models for the public API contract."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class LessonRequest(BaseModel):
    """Request schema for lesson generation."""
    session_id: UUID | None = Field(default=None, description="Optional client-generated session identifier")
    topic: str
    level: Literal["beginner", "intermediate"]


class LessonSection(BaseModel):
    """Response section schema for lesson content."""
    id: str
    title: str
    minutes: int
    content_markdown: str


class LessonResponse(BaseModel):
    """Response schema for lesson generation."""
    objective: str
    total_minutes: int
    sections: list[LessonSection]
