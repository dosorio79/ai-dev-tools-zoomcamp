# django-coding-agent

Scaffold for a future coding agent that can automate modifications to the Django TODO
project in `04.1-todo_agent_version`. The goal is to provide a clean starting point
before wiring it up to PydanticAI (or the orchestration framework of your choice).

## Project layout

```
django-coding-agent/
├── agent/
│   ├── __init__.py
│   ├── agent.py
│   ├── prompts.py
│   ├── state.py
│   └── tools.py
├── cli.py
├── config/
│   ├── agent.yaml
│   ├── repository.yaml
│   └── workspace.yaml
└── pyproject.toml
```

`agent/` hosts the PydanticAI wrapper, prompt, typed state, and filesystem helpers.
`cli.py` offers a minimal entry point so you can run or debug the agent locally,
while [`config/`](config/) provides the model settings and repository policy.

## Getting started

1. Install dependencies (uv, pip, rye, etc.)
   ```
   uv pip install -e ./django-coding-agent
   ```
2. Adjust [`config/workspace.yaml`](config/workspace.yaml) so `workspace_root` points to an existing Django
   project (the CLI validates it, even though the runtime path is passed via `--repo-path`).
3. Run a task:
   ```
   uv run python django-coding-agent/cli.py --repo-path ../04.1-todo_agent_version "read the README"
   ```

The CLI prints the agent response to stdout and does not persist runs or enforce
structured output.

## Configuration

The configuration is split across three files in [`config/`](config/):

[`config/workspace.yaml`](config/workspace.yaml):

```yaml
workspace_root: ../04.1-todo_agent_version
```

[`config/agent.yaml`](config/agent.yaml):

```yaml
model: gpt-4.1-mini
max_steps: 25
dry_run: true
log_level: INFO
```

[`config/repository.yaml`](config/repository.yaml):

```yaml
deny_dirs:
  - .git
  - .venv
  - venv
  - __pycache__
  - node_modules
  - dist
  - build
  - .mypy_cache
  - .pytest_cache

allowed_extensions:
  - .py
  - .html
  - .txt
  - .md
  - .toml
  - .yaml
  - .yml
  - .json
```

The CLI consumes `agent.yaml` and `repository.yaml`; `workspace.yaml` is only used
for validation. Override the config directory path through `--config-dir`.

## Next steps

- Expand `agent/tools.py` with Django-aware helpers (running `manage.py`, inspecting
  models, parsing templates, etc.).
- Persist agent runs by serializing `AgentState` to disk or to your telemetry stack.
- Wire config values like `dry_run`/`log_level` into the CLI runtime.
- Connect the CLI to a task queue (Celery, Temporal, Prefect) once you're ready to
  schedule long-running tasks.
