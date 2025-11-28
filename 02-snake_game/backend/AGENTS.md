# Backend Agent Playbook

Use this when coding the backend with AI assistants.

## Non‑negotiables
- OpenAPI spec (`openapi/api.yaml`) is the source of truth; update the spec before code and don’t add endpoints not in it.
- Generate FastAPI stubs from the spec (openapi-generator or fastapi-codegen); put business logic in the generated routers/models without breaking the spec.
- Use uv for everything: `uv add`, `uv sync`, `uv run fastapi dev`, `uv run python <file>`.
- Storage progression: in-memory for quick spikes → SQLite for local/tests → Postgres in Docker Compose.
- Tests are required: unit for business logic, contract checks (e.g., `verify_api.py`), integration tests with SQLite.
- Commit early and often with clear messages when changing spec, code, or tests.
- Runtime targets: `uv run fastapi dev` and `uv run python main.py`.
- Docker Compose: backend uses Postgres; frontend served via Nginx/static container; keep services healthy.

## Flow for new work
1) Confirm or update the spec.  
2) Regenerate server stubs.  
3) Implement logic and Pydantic models in generated files.  
4) Add/refresh tests and ensure contract checks pass.  
5) Run locally with uv; validate in Compose.

## PR checklist
- Spec and generated code are in sync.
- Dependencies added with uv.
- Tests updated and passing.
- DB migrations/fixtures included when schema changes.
- Commits are small, frequent, and well-described.
