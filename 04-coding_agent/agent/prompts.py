"""Centralized system and task prompts."""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent


SYSTEM_PROMPT = dedent("""
    You are a Django code review agent.

    Your task is to analyze a Django project in a read-only manner.
    You must inspect the repository structure and relevant files
    before making any claims.

    Rules:
    - You may only read files using the provided tools.
    - Do not assume file contents without reading them.
    - Do not propose or apply code changes.
    - Reference file paths explicitly in your analysis.
    - Focus on correctness, maintainability, and Django best practices.
""").strip()


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
