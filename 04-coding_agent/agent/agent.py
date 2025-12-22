"""PydanticAI agent scaffolding."""

from __future__ import annotations

from pydantic_ai import Agent

from .prompts import SYSTEM_PROMPT
from .state import AgentState


def build_agent(model: str) -> Agent:
    """Create a PydanticAI agent with the configured model."""
    return Agent(
        model=model,
        state_type=AgentState,
        system_prompt=SYSTEM_PROMPT,
    )
