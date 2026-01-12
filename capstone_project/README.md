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
  - Generate structured lesson content
  - Validate the lesson against time and level constraints
- Returns the lesson as structured Markdown
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

The frontend was developed contract-first using mocked responses derived from this specification.

## Frontend code execution

The frontend can execute Python snippets in lessons using Pyodide (running in the browser). Python code blocks include a Run button and display stdout output. If a snippet does not print anything, the UI prompts the learner to add a `print(...)` statement.

You can override the Pyodide base URL with `VITE_PYODIDE_BASE` (defaults to the jsDelivr CDN).

---

## Agent-based workflow

Lesson generation is implemented using multiple cooperating agents:

- **PlannerAgent** – defines lesson structure and time budget
- **ContentAgent** – generates Markdown content per section
- **ValidatorAgent** – ensures lesson length is 15 minutes by adjusting section minutes

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

The API will be available at:

- http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs

The frontend container will be available at:

- http://localhost:8080

### Frontend (mocked API)

The frontend currently uses a mocked API client that follows `openapi.yaml` and does not call the backend.

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at:

- http://localhost:8080

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

Frontend tests:

```bash
cd frontend
npm test
```

---

## Future work

- Authentication and user accounts
- Lesson personalization
- Automated exercise evaluation
- Learning analytics and feedback loops
