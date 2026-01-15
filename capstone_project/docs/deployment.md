# Deployment and container model

## Overview

The system is composed of multiple containers that run together as a single application using Docker Compose.

Each container has a single responsibility and runs as an independent service.

There is no single “monolithic” container.

---

## Containers in this project

### Backend container

The backend container runs the application logic.

It includes:
- FastAPI application
- Agent orchestration logic
- MongoDB client (driver only)

It does NOT include:
- A database engine
- Persistent storage

The backend container exposes the API at:

- http://localhost:8000

---

### MongoDB container

MongoDB runs in its own dedicated container.

It is responsible for:
- Storing lesson generation telemetry
- Persisting data across restarts

It contains:
- The MongoDB database engine
- A persistent Docker volume for data

It does NOT contain:
- Application code
- API logic

The backend connects to MongoDB over Docker’s internal network.

---

### Frontend container

The frontend runs in a separate container.

It serves:
- A static React (Vite) build
- No server-side logic

Important notes:
- The frontend currently uses a mocked API client
- It does not call the backend yet
- The container exists for reproducibility and mirrors the production static build

The frontend container serves the UI at:

- http://localhost:8080

---

## Environment configuration

The backend reads environment variables from `.env` or the container environment:

- `OPENAI_API_KEY`: required when `USE_LLM_CONTENT=true`
- `MODEL`: LLM model name (defaults to `gpt-4.1-mini`)
- `USE_LLM_CONTENT`: toggle LLM-backed content generation (`true`/`false`)
