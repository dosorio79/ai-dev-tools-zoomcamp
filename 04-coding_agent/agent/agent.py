"""PydanticAI agent scaffolding."""

from __future__ import annotations

from pydantic_ai import Agent
from .state import AgentState

agent = Agent(
    model="gpt-4o-mini",  # or equivalent
    state_type=AgentState,
    system_prompt=...
)
