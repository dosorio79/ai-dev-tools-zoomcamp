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

What is covered:

- Agent planning and validation logic.
- Lesson orchestration.
- API contract and integration workflow.

## Notes

- The frontend uses a mocked API client and does not call the backend.
- Integration tests that require MongoDB should run with `docker compose up`.
