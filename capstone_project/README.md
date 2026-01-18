# Agentic Micro-Learning Platform

## Problem statement

Data practitioners frequently need to learn or refresh a specific concept quickly, but most educational resources are long, unfocused, or poorly adapted to short learning sessions.

This project addresses that problem by generating **focused 15-minute lessons on demand**, tailored to a given topic and difficulty level.

---

## What the system does

The system:

- Accepts a topic and difficulty level from the user
- Uses multiple AI agents to:
  - Plan a pedagogically scoped lesson
  - Generate structured content blocks
  - Validate lesson structure and time constraints
- Renders structured blocks into Markdown for the frontend
- Logs each lesson generation run for telemetry purposes

The system is stateless from a user perspective, but includes a persistence layer for session-level logging.

---

## High-level architecture

```
Frontend (React)
        |
        v
     POST /lesson
        |
        v
FastAPI Backend
 ├── Agent orchestration
 ├── OpenAPI contract
 └── MongoDB telemetry
        |
        v
     MongoDB
```

---

## API contract

The backend exposes a single public endpoint:

- `POST /lesson`

The API contract is defined using **OpenAPI** (`openapi.yaml`) and serves as the single source of truth for frontend and backend development.

The frontend follows this contract for real HTTP calls to the backend.

## Frontend code execution

The frontend can execute Python snippets in lessons using Pyodide (running in the browser). Python code blocks include a Run button and display stdout output. If a snippet does not print anything, the UI prompts the learner to add a `print(...)` statement.

You can override the Pyodide base URL with `VITE_PYODIDE_BASE` (defaults to the jsDelivr CDN).

---

## Agent-based workflow

Lesson generation is implemented using multiple cooperating agents:

- **PlannerAgent** – defines lesson structure and time budget
- **ContentAgent** – generates structured content blocks per section (stub)
- **ContentAgentLLM** – optional LLM-backed content generator
- **ValidatorAgent** – enforces structure (required sections, block formatting) and normalizes section minutes to 15 total

Prompt sources for the LLM content agent:
- System prompt: `app/agents/prompts/content_llm_system.txt`
- User prompt template: `app/agents/prompts/content_llm_user.txt`
See `docs/prompts.md` for editing guidance.

Prompt rules summary:
- Text blocks must include a paragraph and a bullet or numbered list.
- Exercise blocks must be plain text without `:::exercise` markers or markdown fences.

Frontend UX:
- Per-section copy buttons and full-lesson Markdown export.
- Feedback prompt and improved loading/error states.

A detailed description of agent responsibilities and orchestration can be found in `docs/agent-architecture.md`.
The lesson format PoC and validator rule candidates are summarized in `docs/lesson-generation-poc.md`.

Rules and constraints for AI-assisted development are defined in `AGENTS.md`.

---

## Telemetry and persistence

The application logs each lesson generation run to MongoDB, storing:

- Session identifier
- Request parameters
- Generated lesson content
- Validation metadata
- Timestamp

This telemetry-first design mirrors authenticated usage patterns and allows a future transition to authenticated user sessions without schema changes.

---

## Technologies used

- Frontend: React
- Backend: FastAPI (Python 3.12)
- AI: Large Language Model (LLM)
- Database: MongoDB
- API specification: OpenAPI 3.0
- Containerization: Docker, docker-compose
- Dependency management: uv

---

## Running the project locally

### Requirements

- Docker and docker-compose
- Python 3.12+
- uv
- Node.js 18+

### Start the system

```bash
docker compose up --build
```

This starts the backend, MongoDB, and the frontend container.

Note: the frontend image expects a prebuilt `frontend/dist` (run `npm run build` in `frontend/` before building the containers).

Quick start (recommended):

```bash
make build
```

If you've already built the images, you can use:

```bash
make start
```

For Docker, the frontend container proxies `/lesson` and `/health` to the backend, so you can
leave `API_BASE` empty in `frontend/public/runtime-config.js` to use same-origin requests.
To call the backend directly, set `API_BASE` to `http://localhost:8000`.

The API will be available at:

- http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs

The frontend container will be available at:

- http://localhost:8080

### Configuration

Create your environment file from `.env-example` and update values as needed:

- `OPENAI_API_KEY`: required when `USE_LLM_CONTENT=true`
- `MODEL`: LLM model name (defaults to `gpt-4.1-mini`)
- `USE_LLM_CONTENT`: toggle LLM-backed content generation (`true`/`false`)
- `CORS_ORIGINS`: comma-separated list of allowed origins (default: `http://localhost:8080`)

### Frontend (real API)

The frontend calls the backend directly via `frontend/src/api/lessonClient.ts`.

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at:

- http://localhost:8080

Set `VITE_API_BASE` in `frontend/.env` to change the backend URL (defaults to `http://localhost:8000`).
The runtime config (`frontend/public/runtime-config.js`) can override this at runtime without a rebuild.

---

## Testing

Tests cover:

- Agent planning and validation logic
- Lesson orchestration
- API contract and integration workflow

Run tests with:

```bash
uv run pytest
```

Run specific categories with markers:

```bash
pytest -m unit
pytest -m llm
pytest -m api
pytest -m integration
```

Frontend tests:

```bash
cd frontend
npm test
```

Makefile shortcuts:

```bash
make test
make test-unit
make test-api
make test-llm
make test-integration
```

---

## Future work

- Authentication and user accounts
- Lesson personalization
- Automated exercise evaluation
- Learning analytics and feedback loops

## Changelog

See `CHANGELOG.md` for release notes.
