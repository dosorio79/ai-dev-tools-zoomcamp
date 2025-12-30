"""CLI entry point for the Django coding agent (typed-first)."""

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

load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Django coding agent.")
    parser.add_argument(
        "--repo-path",
        type=Path,
        required=True,
        help="Path to the Django project to analyze",
    )
    parser.add_argument(
        "task",
        type=str,
        help="Task description for the agent",
    )
    parser.add_argument(
        "--config-dir",
        type=Path,
        default=Path("config"),
        help="Directory containing agent.yaml, repository.yaml, workspace.yaml",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config_dir = args.config_dir.resolve()

    # ---------------------------------------------------------------------
    # Load typed configuration
    # ---------------------------------------------------------------------
    agent_cfg = load_agent_config(config_dir / "agent.yaml")
    repo_policy = load_repository_policy(config_dir / "repository.yaml")
    load_workspace_config(config_dir / "workspace.yaml")  # validated, not used further

    logging.basicConfig(level=agent_cfg.log_level)

    # ---------------------------------------------------------------------
    # Build agent state
    # ---------------------------------------------------------------------
    state = AgentState(
        repository_path=args.repo_path,
        task=args.task,
        policy=repo_policy,
    )

    if agent_cfg.dry_run:
        print("Dry run enabled; no agent execution performed.")
        return

    # ---------------------------------------------------------------------
    # Create and run agent
    # ---------------------------------------------------------------------
    agent = create_agent(
        model_name=agent_cfg.model,
        max_steps=agent_cfg.max_steps,
    )

    result = agent.run(state)
    print(result.response)


if __name__ == "__main__":
    main()
