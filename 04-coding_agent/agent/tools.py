"""Filesystem + Django-aware helpers exposed as agent tools."""

from __future__ import annotations

from pathlib import Path
from typing import List
import subprocess

from pydantic_ai import RunContext

from agent.policy import RepositoryPolicy
from agent.state import AgentState


# ---------------------------------------------------------------------------
# Internal helpers (not agent tools)
# ---------------------------------------------------------------------------

def _list_files_for_policy(
    repository_path: Path,
    policy: RepositoryPolicy,
) -> List[str]:
    """List relevant files in the repository according to policy."""
    results: List[str] = []

    for path in repository_path.rglob("*"):
        # Skip denied directories entirely
        if path.is_dir():
            if path.name in policy.deny_dirs:
                continue
            continue

        # Skip files inside denied directories
        if any(part in policy.deny_dirs for part in path.parts):
            continue

        # Extension filter
        if path.suffix not in policy.allowed_extensions:
            continue

        results.append(str(path.relative_to(repository_path)))

    results.sort()
    return results


# ---------------------------------------------------------------------------
# Agent tools
# ---------------------------------------------------------------------------

def list_files(ctx: RunContext[AgentState]) -> List[str]:
    """List relevant files in the repository according to policy."""
    state = ctx.deps
    return _list_files_for_policy(
        state.repository_path,
        state.policy,
    )


def read_file(
    ctx: RunContext[AgentState],
    relative_path: str,
    max_chars: int = 10_000,
) -> str:
    """Read a file safely from the repository."""
    state = ctx.deps
    policy = state.policy
    root = state.repository_path
    candidate = (root / relative_path).resolve()

    if not candidate.is_relative_to(root):
        raise ValueError("Attempted to read file outside repository")

    if any(part in policy.deny_dirs for part in candidate.parts):
        raise ValueError("File is in a denied directory")

    if candidate.suffix not in policy.allowed_extensions:
        raise ValueError("File extension not allowed")

    if not candidate.exists() or not candidate.is_file():
        raise ValueError("File does not exist or is not a file")

    content = candidate.read_text(encoding="utf-8", errors="replace")

    if len(content) > max_chars:
        content = content[:max_chars] + "\n\n[TRUNCATED]"

    return content


def run_django_check(ctx: RunContext[AgentState]) -> str:
    """Run `python manage.py check` in the target Django project."""
    root = ctx.deps.repository_path
    manage_py = root / "manage.py"

    if not manage_py.exists():
        raise ValueError("manage.py not found in repository root")

    result = subprocess.run(
        ["python", "manage.py", "check"],
        cwd=root,
        capture_output=True,
        text=True,
    )

    output = result.stdout
    if result.stderr:
        output += "\n\n[stderr]\n" + result.stderr

    return output
