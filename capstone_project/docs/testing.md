# Testing

## Overview

This project includes frontend and backend test suites. Follow the sections below to run each suite locally.

## Frontend tests

Location: `frontend/`

```bash
cd frontend
npm test
```

What is covered:

- Lesson rendering from mocked API response.
- Full user flow (input → generate → lesson appears).
- Python code block Run button behavior.
- Exercise block rendering.

## Backend tests

Location: project root

```bash
uv run pytest
```

If you see cache permission errors, you can run with a project-local cache:

```bash
UV_CACHE_DIR=.uv-cache uv run pytest
```

What is covered:

- Agent planning and validation logic.
- Lesson orchestration.
- API contract and integration workflow.

If you prefer using the system interpreter instead of `uv`, ensure `pytest` is installed in your environment, then run:

```bash
python -m pytest
```

## Notes

- The frontend uses a mocked API client and does not call the backend.
- Integration tests that require MongoDB should run with `docker compose up`.
