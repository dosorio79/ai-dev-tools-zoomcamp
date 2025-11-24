# Backend Development Guidelines

## Using uv
- Run: `uv run python <file.py>`
- Add dependencies: `uv add <package>`
- Sync environment: `uv sync`

## General Rules
- Follow the OpenAPI spec as the source of truth.
- Use FastAPI and Pydantic models.
- Make all endpoints match the OpenAPI spec exactly.
- Write unit tests for each endpoint.
- Use SQLite for local dev, Postgres in production.
