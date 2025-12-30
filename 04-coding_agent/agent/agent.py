from pydantic_ai import Agent, UsageLimits

from agent.state import AgentState
from agent.prompts import SYSTEM_PROMPT
from agent.tools import list_files, read_file, run_django_check


class DjangoCodingAgent:
    """Thin wrapper around PydanticAI with a state-first interface."""

    def __init__(self, model_name: str, max_steps: int) -> None:
        self._agent = Agent(
            model=model_name,
            system_prompt=SYSTEM_PROMPT,
            deps_type=AgentState,
        )
        self._agent.tool(list_files)
        self._agent.tool(read_file)
        self._agent.tool(run_django_check)
        self._usage_limits = UsageLimits(request_limit=max_steps)

    def run(self, state: AgentState):
        return self._agent.run_sync(
            state.task,
            deps=state,
            usage_limits=self._usage_limits,
        )


def create_agent(model_name: str, max_steps: int) -> DjangoCodingAgent:
    """Create and configure the Django coding agent (state-driven)."""
    return DjangoCodingAgent(model_name=model_name, max_steps=max_steps)
