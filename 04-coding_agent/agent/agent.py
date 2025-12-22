from pydantic_ai import Agent

from agent.policy import RepositoryPolicy
from agent.prompts import SYSTEM_PROMPT
from agent.state import AgentState
from agent.tools import list_files, read_file, run_django_check


def build_agent(model_name: str, max_steps: int) -> Agent[AgentState, RepositoryPolicy]:
    agent = Agent(
        model=model_name,
        system_prompt=SYSTEM_PROMPT,
        max_steps=max_steps,
        deps_type=RepositoryPolicy,
    )

    agent.tool(list_files)
    agent.tool(read_file)
    agent.tool(run_django_check)

    return agent
