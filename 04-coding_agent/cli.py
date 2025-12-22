"""CLI entry point for the Django coding agent."""

from __future__ import annotations

import argparse
from pathlib import Path

from config.config import load_config
from agent.agent import build_agent
from agent.policy import RepositoryPolicy
from agent.prompts import task_prompt
from agent.state import AgentDeps
from agent.tools import list_files_for_policy
from dotenv import load_dotenv

load_dotenv()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Django coding agent.")
    parser.add_argument("--config-dir", type=Path, default=None, help="Config directory override.")

    subparsers = parser.add_subparsers(dest="command", required=True)
    run_parser = subparsers.add_parser("run", help="Run a task against the workspace.")
    run_parser.add_argument("task", type=str, help="Task prompt for the agent.")
    run_parser.add_argument("--workspace-root", type=Path, default=None)
    run_parser.add_argument("--model", type=str, default=None)
    run_parser.add_argument("--max-steps", type=int, default=None)
    run_parser.add_argument("--dry-run", action="store_true", default=None)
    run_parser.add_argument("--log-level", type=str, default=None)
    run_parser.add_argument(
        "--list-files",
        action="store_true",
        help="List files visible under the repository policy.",
    )

    return parser.parse_args()


def _apply_overrides(config: dict, args: argparse.Namespace) -> dict:
    overrides = {
        "workspace_root": args.workspace_root,
        "model": args.model,
        "max_steps": args.max_steps,
        "dry_run": args.dry_run if args.dry_run is not None else None,
        "log_level": args.log_level,
    }
    for key, value in overrides.items():
        if value is not None:
            config[key] = value
    return config


def main() -> None:
    args = _parse_args()
    config = load_config(args.config_dir)
    config = _apply_overrides(config, args)

    policy = RepositoryPolicy(
        deny_dirs=set(config["deny_dirs"]),
        allowed_extensions=set(config["allowed_extensions"]),
    )
    deps = AgentDeps(
        repository_path=Path(config["workspace_root"]),
        policy=policy,
    )

    print("Loaded config for workspace:", deps.repository_path)
    print("Task:", args.task)
    print("Dry run:", config.get("dry_run", True))

    if args.list_files:
        for path in list_files_for_policy(deps.repository_path, policy):
            print(path)

    if config.get("dry_run", True):
        print("Dry run enabled; no agent execution performed.")
        return

    agent = build_agent(model_name=config["model"])
    prompt = task_prompt(args.task, deps.repository_path)
    result = agent.run_sync(prompt, deps=deps)
    print(result.response)


if __name__ == "__main__":
    main()
