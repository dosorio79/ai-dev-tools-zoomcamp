"""MongoDB telemetry models and validation wrappers."""

from dataclasses import dataclass
from datetime import datetime
from typing import Any, List, Literal, Optional

from pydantic import BaseModel


# -----------------------------
# Validation model (boundary)
# -----------------------------

class LessonRunModel(BaseModel):
    """Pydantic validation model for telemetry records."""
    run_id: str
    session_id: str
    topic: str
    level: Literal["beginner", "intermediate"]
    created_at: datetime
    total_minutes: int
    objective: str
    section_ids: List[str]


class LessonFailureModel(BaseModel):
    """Pydantic validation model for failure records."""
    run_id: str
    session_id: str
    topic: str
    level: Literal["beginner", "intermediate"]
    created_at: datetime
    error_type: str
    error_message: str
    error_details: Optional[List[dict[str, Any]]] = None


# -----------------------------
# Internal telemetry model
# -----------------------------

@dataclass(frozen=True)
class LessonRun:
    """Validated telemetry record for a lesson generation run."""
    run_id: str
    session_id: str
    topic: str
    level: Literal["beginner", "intermediate"]
    created_at: datetime
    total_minutes: int
    objective: str
    section_ids: List[str]

    def __post_init__(self) -> None:
        """Validate fields once at construction time."""
        # Validate once at construction time
        LessonRunModel(
            run_id=self.run_id,
            session_id=self.session_id,
            topic=self.topic,
            level=self.level,
            created_at=self.created_at,
            total_minutes=self.total_minutes,
            objective=self.objective,
            section_ids=self.section_ids,
        )

    def to_mongo(self) -> dict:
        """Convert the telemetry record to a MongoDB-ready document."""
        return {
            "run_id": self.run_id,
            "session_id": self.session_id,
            "topic": self.topic,
            "level": self.level,
            "created_at": self.created_at,
            "total_minutes": self.total_minutes,
            "objective": self.objective,
            "section_ids": self.section_ids,
        }


@dataclass(frozen=True)
class LessonFailure:
    """Validated telemetry record for a lesson generation failure."""
    run_id: str
    session_id: str
    topic: str
    level: Literal["beginner", "intermediate"]
    created_at: datetime
    error_type: str
    error_message: str
    error_details: Optional[List[dict[str, Any]]] = None

    def __post_init__(self) -> None:
        """Validate fields once at construction time."""
        LessonFailureModel(
            run_id=self.run_id,
            session_id=self.session_id,
            topic=self.topic,
            level=self.level,
            created_at=self.created_at,
            error_type=self.error_type,
            error_message=self.error_message,
            error_details=self.error_details,
        )

    def to_mongo(self) -> dict:
        """Convert the failure record to a MongoDB-ready document."""
        return {
            "run_id": self.run_id,
            "session_id": self.session_id,
            "topic": self.topic,
            "level": self.level,
            "created_at": self.created_at,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "error_details": self.error_details,
        }
