"""Pydantic models that represent agent state."""

from __future__ import annotations
from pathlib import Path
from pydantic import BaseModel, field_validator

from .policy import RepositoryPolicy


class AgentState(BaseModel):
    """Represents the state of the coding agent."""

    repository_path: Path
    task: str
    policy: RepositoryPolicy

    @field_validator("repository_path")
    @classmethod
    def validate_repository_path(cls, value: Path) -> Path:
        path = value.expanduser().resolve()

        if not path.exists():
            raise ValueError(f"Repository path does not exist: {path}")

        if not path.is_dir():
            raise ValueError(f"Repository path is not a directory: {path}")

        return path

    @field_validator("task")
    @classmethod
    def validate_task(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Task cannot be empty.")
        return value.strip()

    model_config = {
        "arbitrary_types_allowed": True,
    }
