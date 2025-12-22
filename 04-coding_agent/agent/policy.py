from pydantic import BaseModel, field_validator
from typing import Set


class RepositoryPolicy(BaseModel):
    """Policy defining which parts of a repository the agent may access."""

    deny_dirs: Set[str]
    allowed_extensions: Set[str]

    @field_validator("deny_dirs")
    @classmethod
    def validate_deny_dirs(cls, value: Set[str]) -> Set[str]:
        if not value:
            raise ValueError("deny_dirs must not be empty")

        # Normalize directory names
        return {v.strip() for v in value if v.strip()}

    @field_validator("allowed_extensions")
    @classmethod
    def validate_allowed_extensions(cls, value: Set[str]) -> Set[str]:
        if not value:
            raise ValueError("allowed_extensions must not be empty")

        normalized = set()
        for ext in value:
            ext = ext.strip()
            if not ext.startswith("."):
                raise ValueError(f"Invalid extension '{ext}': must start with '.'")
            normalized.add(ext)

        return normalized

    model_config = {
        "extra": "forbid",
    }
