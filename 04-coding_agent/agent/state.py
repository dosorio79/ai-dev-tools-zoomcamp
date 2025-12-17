"""Pydantic models that represent agent state."""

from __future__ import annotations
from pathlib import Path
from pydantic import BaseModel, field_validator

class AgentState(BaseModel):
    """Represents the state of the coding agent."""
    repository_path: Path
    task: str
    
    @field_validator("repository_path")
    @classmethod
    def validate_repository_path(cls, value: Path) -> Path:
        """Ensure the repository path is valid."""
        # Normalize the path
        path = value.expanduser().resolve()
        # Check if the path exists and is a directory
        if not path.exists():
            raise ValueError(f"Repository path does not exist: {path}")
        
        if not path.is_dir():
            raise ValueError(f"Repository path is not a directory: {path}") 
        
        return path
    
    @field_validator("task")
    @classmethod
    def validate_task(cls, value: str) -> str:
        """Ensure the task is not empty."""
        if not value or not value.strip():
            raise ValueError("Task cannot be empty.")
        return value

    model_config = {
        "arbitrary_types_allowed": True,
    }
        