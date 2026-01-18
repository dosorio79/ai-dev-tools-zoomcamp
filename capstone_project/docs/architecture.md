# Architecture

## Scope

This document describes the system structure and data flow for the uLearn capstone project. It complements `docs/agent-architecture.md` with a broader, system-level view.

## High-level system

- Frontend (React + Vite + Tailwind) renders the lesson UI by calling the backend API defined in `openapi.yaml`.
- Backend (FastAPI) exposes `/lesson` and `/health` endpoints.
- MongoDB stores append-only telemetry for lesson generations.

## Request flow

1) User submits a topic and difficulty.
2) Frontend calls the backend API via the lesson client.
3) Backend orchestrates lesson generation via agents.
4) Backend validates, renders blocks to Markdown, and returns a `LessonResponse`.
5) Backend writes telemetry to MongoDB.
6) Frontend renders the lesson sections with Markdown and syntax highlighting.

## Backend layout

- `app/main.py`: FastAPI app creation and wiring.
- `app/api/lesson.py`: HTTP boundary for `/lesson`.
- `app/services/lesson_service.py`: Orchestrates agent flow.
- `app/services/markdown_renderer.py`: Deterministic block-to-Markdown rendering.
- `app/agents/*`: Planner, content, and validator agents.
- `app/services/mongo.py`: MongoDB client and persistence helpers.
- `app/models/api.py`: Pydantic models aligned with `openapi.yaml`.
- `app/models/db.py`: MongoDB document models.
- `app/core/config.py`: Environment and settings.
- `app/core/logging.py`: Application logging.

## Frontend layout

- `frontend/src/api/lessonClient.ts`: API client for lesson calls.
- `frontend/src/types/lesson.ts`: Shared request/response types.
- `frontend/src/pages/Home.tsx`: Input flow and lesson rendering.
- `frontend/src/components/*`: Lesson section rendering, code blocks, exercise blocks.

UX notes:
- Sections include chip headers with copy actions and full-lesson export controls.
- Loading includes elapsed-time phases with progress and toast error handling.

## Contracts and constraints

- OpenAPI contract in `openapi.yaml` is the single source of truth.
- Only `/lesson` and `/health` endpoints are supported.
- No authentication, sessions, or personalization.
- No background jobs or queues.
- Persistence is limited to telemetry logging.

## Deployment topology

- Docker Compose runs the backend, MongoDB, and the frontend static container together.
- Local development can still run the frontend separately via `npm run dev` in `frontend/`.
