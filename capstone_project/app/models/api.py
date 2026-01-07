from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class LessonRequest(BaseModel):
    session_id: UUID | None = Field(default=None, description="Optional client-generated session identifier")
    topic: str
    level: Literal["beginner", "intermediate"]


class LessonSection(BaseModel):
    id: str
    title: str
    minutes: int
    content_markdown: str


class LessonResponse(BaseModel):
    objective: str
    total_minutes: int
    sections: list[LessonSection]
