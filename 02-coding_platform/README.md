# Collaborative Coding Interview Platform

This repository is the workspace for the AI Dev Tools Zoomcamp Module 2 homework: a real-time collaborative interview arena inspired by CoderPad/CodeSignal/Leetcode. The frontend is assembled with React + Vite while the backend is expected to host an Express + WebSocket server backed by an in-memory session store. All execution happens safely in the browser (JS via a sandboxed iframe, Python through Pyodide).

## Repository layout
- `frontend/` – Vite + React UI generated with Lovable; includes the collaborative editor, run panel, participant list, and local WASM runners.
- `backend/` – placeholder for the Express + WebSocket server that will expose `/session` REST routes and `/ws/<sessionId>` sockets and keep sessions in memory.
- `docs/` – living requirements, system design, deployment, REST + WebSocket API contracts, and runtime safety notes for the project.
- `README.md` – this file.
- `AGENTS.md` – guidance for future contributor/AI agents who continue this work.
- `.gitignore` – node/Vite-friendly ignore rules.

## Documentation highlights
- `docs/OVERVIEW.md` summarizes the goal and architecture.
- `docs/REQUIREMENT.md` lists functional/technical expectations.
- `docs/SYSTEM_DESIGN.md` sketches the frontend/backend flow and WebSocket data model.
- `docs/API_REST.md` + `docs/API_WEBSOCKETS.md` define the HTTP and WS contracts to implement.
- `docs/DEPLOYMENT.md` explains the local Docker Compose workflow and the single-container Render deployment.
- `docs/RUNTIME_WASM.md` explains how JS and Python run inside browser sandboxes.

## Local development (frontend)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend hot-reloads on port 5173 and speaks to the backend over REST on `http://localhost:8000` plus WS on `ws://localhost:8000/ws/<sessionId>`. The current backend is empty, so building that layer is the next implementation milestone.

## Bringing the backend online
- Implement the REST endpoints and WebSocket relay described in `docs/API_REST.md` and `docs/API_WEBSOCKETS.md`.
- Maintain the in-memory session store outlined in `docs/SYSTEM_DESIGN.md`.
- Bundle frontend/build output into the backend (see `docs/DEPLOYMENT.md`) for multi-service local work and a single-container Render deployment.

## Next steps
- Flesh out the `backend/` service (Express + WebSocket logic, session store).
- Wire up docker+deployment scripts if you want to match the documented workflow.
- Keep the docs in sync as the implementation evolves.
