from pydantic_ai import Agent

from agent.state import AgentDeps
from agent.prompts import SYSTEM_PROMPT
from agent.tools import list_files, read_file, run_django_check


def build_agent(model_name: str) -> Agent[str, AgentDeps]:
    agent = Agent(
        model=model_name,
        system_prompt=SYSTEM_PROMPT,
        deps_type=AgentDeps,
    )

    agent.tool(list_files)
    agent.tool(read_file)
    agent.tool(run_django_check)

    return agent
