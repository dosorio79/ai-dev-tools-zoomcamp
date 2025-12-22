from pathlib import Path
from typing import Dict, Any

import yaml
from pydantic import BaseModel, field_validator

from agent.policy import RepositoryPolicy


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _load_yaml(path: Path) -> Dict[str, Any]:
    """Load and validate a YAML config file."""
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if data is None:
        raise ValueError(f"Config file is empty: {path}")

    if not isinstance(data, dict):
        raise ValueError(f"Config file must contain a YAML mapping: {path}")

    return data


# ---------------------------------------------------------------------------
# Agent runtime configuration
# ---------------------------------------------------------------------------

class AgentConfig(BaseModel):
    """Runtime configuration for the coding agent."""

    model: str
    max_steps: int = 25
    dry_run: bool = True
    log_level: str = "INFO"

    @field_validator("max_steps")
    @classmethod
    def validate_max_steps(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("max_steps must be a positive integer")
        return value

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, value: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR"}
        level = value.upper()
        if level not in allowed:
            raise ValueError(f"log_level must be one of {allowed}")
        return level

    model_config = {
        "extra": "forbid",
    }


def load_agent_config(path: Path) -> AgentConfig:
    """Load AgentConfig from agent.yaml."""
    data = _load_yaml(path)
    return AgentConfig(**data)


# ---------------------------------------------------------------------------
# Workspace configuration
# ---------------------------------------------------------------------------

class WorkspaceConfig(BaseModel):
    """Execution environment configuration for the agent."""

    workspace_root: Path

    @field_validator("workspace_root")
    @classmethod
    def validate_workspace_root(cls, value: Path) -> Path:
        path = value.expanduser().resolve()

        if not path.exists():
            raise ValueError(f"workspace_root does not exist: {path}")

        if not path.is_dir():
            raise ValueError(f"workspace_root is not a directory: {path}")

        return path

    model_config = {
        "extra": "forbid",
    }


def load_workspace_config(path: Path) -> WorkspaceConfig:
    """Load WorkspaceConfig from workspace.yaml."""
    data = _load_yaml(path)
    return WorkspaceConfig(**data)


# ---------------------------------------------------------------------------
# Repository policy loader
# ---------------------------------------------------------------------------

def load_repository_policy(path: Path) -> RepositoryPolicy:
    """Load RepositoryPolicy from repository.yaml."""
    data = _load_yaml(path)
    return RepositoryPolicy(**data)
