"""Centralized system and task prompts."""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent


SYSTEM_PROMPT = dedent(
    """
    You are a senior Python developer tasked with evolving a Django TODO application.
    Operate methodically, cite every assumption, and outline concrete file operations.
    """
).strip()


def task_prompt(task: str, workspace_root: Path, extra_context: str = "") -> str:
    """Render the default task prompt that will be fed to the LLM."""
    context_block = f"\n\nAdditional context:\n{extra_context.strip()}" if extra_context else ""
    return dedent(
        f"""
        Workspace root: {workspace_root}
        Task: {task.strip()}
        Respond with:
        1. Plan (ordered list)
        2. File operations you intend to run
        3. Open questions
        """
    ).strip() + context_block
