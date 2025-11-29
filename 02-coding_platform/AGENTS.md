# Agent Playbook

This project is the AI Dev Tools Zoomcamp Module 2 workspace for building a real-time collaborative coding interview experience. This playbook outlines how human or AI collaborators should approach the work as agents responsible for advancing the platform.

## Mission
1. Keep the documentation accurate (requirements, APIs, deployment, WASM runtime). The files under `docs/` are the single source of truth.
2. Deliver a React + Vite frontend that renders collaborative editing, participant presence, and safe in-browser execution (see `frontend/src/`).
3. Implement the Express + WebSocket backend that hosts the REST endpoints and relays the WebSocket event stream into an in-memory session store.

## Agent roles
- **Documentation agent**: Maintain `docs/` files whenever UI/REST/WS/architecture decisions change. Update `README.md` or `AGENTS.md` summaries if the structure shifts.
- **Frontend agent**: Work inside `frontend/`. Use `npm install`, `npm run dev`, `npm run build`, and `npm run lint` as needed. Map UI concerns back to `docs/SYSTEM_DESIGN.md` and `docs/RUNTIME_WASM.md`.
- **Backend agent**: Populate `backend/` with the REST + WebSocket implementation described in `docs/API_REST.md` and `docs/API_WEBSOCKETS.md`. Keep session data in RAM and avoid executing user code.

## Workflow expectations
- Always refer to `docs/DEPLOYMENT.md` when you need to reason about how the services should run locally (Docker Compose) and in production (single Render image).
- Capture remaining work by updating this agent playbook or `README.md` so incoming contributors know where to look.
- When adding dependencies, make sure the new entries live under `frontend/package.json` (backend package files are still pending).

## Verification
- Frontend: `npm run lint`, `npm run build`.
- Backend: unit tests / manual WebSocket verification once implemented. Use docs to understand required message types and API payloads.
- Overall: keep the docs and README aligned with the code.
