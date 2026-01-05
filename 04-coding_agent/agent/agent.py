import asyncio
from dataclasses import dataclass

from pydantic_ai import Agent, UsageLimits

from agent.state import AgentState
from agent.prompts import SYSTEM_PROMPT
from agent.policy import RepositoryPolicy
from agent.tools import list_files, read_file, run_django_check


@dataclass(frozen=True)
class StateRunResult:
    data: str
    raw: object


class StateAgent:
    """State-first wrapper around a PydanticAI Agent."""

    def __init__(self, model_name: str, max_steps: int, policy: RepositoryPolicy) -> None:
        self._agent = Agent(
            model=model_name,
            system_prompt=SYSTEM_PROMPT,
        )
        self._policy = policy
        self._max_steps = max_steps
        self._state: AgentState | None = None

        self._agent.tool(self._list_files)
        self._agent.tool(self._read_file)
        self._agent.tool(self._run_django_check)

    def _require_state(self) -> AgentState:
        if self._state is None:
            raise RuntimeError("Agent state is not set for this run.")
        return self._state

    def _list_files(self):
        return list_files(self._require_state(), self._policy)

    def _read_file(self, relative_path: str, max_chars: int = 10_000):
        return read_file(self._require_state(), self._policy, relative_path, max_chars)

    def _run_django_check(self):
        return run_django_check(self._require_state())

    def run(self, state: AgentState) -> StateRunResult:
        self._state = state
        try:
            usage_limits = UsageLimits(request_limit=self._max_steps)
            result = asyncio.run(
                self._agent.run(
                    user_prompt=None,
                    instructions=state.task,
                    usage_limits=usage_limits,
                )
            )
            return StateRunResult(data=result.output, raw=result)
        finally:
            self._state = None


def create_agent(model_name: str, max_steps: int, policy: RepositoryPolicy) -> StateAgent:
    """Create and configure the Django coding agent (state-driven)."""
    return StateAgent(model_name=model_name, max_steps=max_steps, policy=policy)
