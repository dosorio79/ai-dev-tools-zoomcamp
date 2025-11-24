# Backend Development Guidelines (AGENTS.md)

Follow these rules when developing the backend with AI assistants.

---

## 1. Dependency Management
- Use uv for everything:
  - uv add
  - uv sync
  - uv run python …

---

## 2. OpenAPI-First
- Backend must be generated from the OpenAPI spec
- Do not implement endpoints before the spec exists
- Do not add endpoints not in the spec

---

## 3. FastAPI Implementation
- Use openapi-generator or fastapi-codegen
- Add business logic into generated route files
- Start with in-memory mock DB
- Replace with SQLite (tests) then Postgres (Compose)

---

## 4. Testing Requirements
- Unit tests for logic
- Contract tests validating spec conformance
- Integration tests using SQLite
- verify_api.py script to test running server

---

## 5. Running
- uv run fastapi dev
- uv run python main.py

---

## 6. Docker Compose
- Backend must run in Docker
- Use Postgres in Compose
- Frontend served by Nginx or static container
