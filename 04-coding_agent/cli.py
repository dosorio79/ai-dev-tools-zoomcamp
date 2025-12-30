from __future__ import annotations

import argparse
import logging
from pathlib import Path

from dotenv import load_dotenv

from agent.agent import create_agent
from agent.state import AgentState
from config.config import (
    load_agent_config,
    load_repository_policy,
    load_workspace_config,
)
from pydantic_ai import UsageLimits

load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Django coding agent.")
    parser.add_argument("--repo-path", type=Path, required=True)
    parser.add_argument("task", type=str)
    parser.add_argument("--config-dir", type=Path, default=Path("config"))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config_dir = args.config_dir.resolve()

    agent_cfg = load_agent_config(config_dir / "agent.yaml")
    repo_policy = load_repository_policy(config_dir / "repository.yaml")
    load_workspace_config(config_dir / "workspace.yaml")

    logging.basicConfig(level=agent_cfg.log_level)

    state = AgentState(
        repository_path=args.repo_path,
        task=args.task,
        policy=repo_policy,
    )

    if agent_cfg.dry_run:
        print("Dry run enabled; no agent execution performed.")
        return

    agent = create_agent(
        model_name=agent_cfg.model,
    )

    usage_limits = UsageLimits(request_limit=agent_cfg.max_steps)
    result = agent.run_sync(state.task, deps=state, usage_limits=usage_limits)
    print(result.response)


if __name__ == "__main__":
    main()
