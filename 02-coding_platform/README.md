# Collaborative Coding Interview Platform

Real-time coding interview arena (CoderPad/Codesignal style) built for AI Dev Tools Zoomcamp. React + Vite frontend, Express + WebSocket backend, in-memory session store, and browser-only execution (JS sandbox, Python via Pyodide).

## Repository layout
- `frontend/` – Vite + React UI: collaborative editor, run panel, participant presence, WASM runners.
- `backend/` – Express + WS server implementing the OpenAPI spec (`openapi/openapi.yaml`), including `/sessions` REST and `/ws/{sessionId}`.
- `docs/` – source of truth for requirements, APIs, system design, runtime sandboxing, and deployment.
- `AGENTS.md` – contributor/AI playbook; start here when picking up work.
- `openapi/` – OpenAPI definition consumed by backend/frontend.
- `package.json` (root) – convenience dev scripts to run frontend+backend together with `concurrently`.

## Quick start (dev)
```bash
# install root tool (concurrently)
npm install

# install frontend/backend deps
cd frontend && npm install
cd ../backend && npm install

# run both servers in parallel from repo root
npm run dev
```
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3000 for REST, ws://localhost:3000/ws/{sessionId} for WebSocket
- Switch to mock API in the frontend with `VITE_USE_MOCK_API=true` (defaults to real backend).

## Backend surface (high level)
- `POST /sessions` → create session (optional `language`), returns `{ id, createdAt, code, language }`
- `GET /sessions/{sessionId}` → fetch session
- `POST /sessions/{sessionId}/join` → join with `userName`, returns `{ session, user }`
- `GET /sessions/{sessionId}/users` → list users
- `PUT /sessions/{sessionId}/code` → update code (204)
- `PUT /sessions/{sessionId}/language` → change language (204)
- `POST /sessions/{sessionId}/execute` → mock execution result
- `POST /sessions/{sessionId}/leave` → leave session (204)
- WebSocket: `/ws/{sessionId}` emits `code_change`, `user_joined`, `user_left`, `language_change`, `execution_result`

## Frontend wiring
- Uses the real backend client by default (`src/api/index.ts`), with mock API fallback for tests/demos.
- State managed via Zustand (`src/store/interviewStore.ts`).
- WebSocket events update code, presence, and language in real time.

## Docs to read first
- `docs/SYSTEM_DESIGN.md` – architecture and flows.
- `docs/API_REST.md` + `docs/API_WEBSOCKETS.md` – API contracts.
- `docs/RUNTIME_WASM.md` – browser execution model.
- `docs/DEPLOYMENT.md` – local Docker Compose and Render single-container guidance.

## Notes / gaps
- Session data is in-memory only; restart clears state.
- Execution is mocked; real sandbox integration would go in the backend or browser runners.
- Keep docs updated when behavior changes; they are the source of truth.
