# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-01-17

### Added
- Markdown export controls (copy/download full lesson, copy per section).
- Frontend UX refinements (loading phases/progress, “Why it works”, feedback buttons).
- Runtime API base override via `frontend/public/runtime-config.js` for flexible frontend deployment.
- Nginx reverse proxy for `/lesson` and `/health` in the frontend container.

### Changed
- Enforced structured text formatting in validator and prompts.
- Updated exercise markdown fence format for frontend rendering.
- Frontend API client now supports same-origin requests and runtime base selection.
- Backend LLM content generation uses async execution with robust result parsing.
- `/lesson` endpoint serves without trailing-slash redirects.
- Integration tests target localhost Mongo when run from the host.

### Docs
- Documented runtime config, prompt editing, and frontend UX behavior.

## [0.2.0] - 2026-01-17

### Added
- Runtime API base override via `frontend/public/runtime-config.js` for flexible frontend deployment.
- Nginx reverse proxy for `/lesson` and `/health` in the frontend container.

### Changed
- Frontend API client supports same-origin requests and runtime base selection.
- LLM content generation uses async execution with robust result parsing.
- `/lesson` serves without trailing-slash redirects.
- Integration tests target localhost Mongo when run from the host.

### Docs
- Documented runtime config and Docker proxy behavior in frontend and root docs.

## [0.1.0] - 2026-01-01

### Added
- Initial FastAPI backend with `/lesson` and `/health`.
- Agent pipeline (planner, content, validator) and Mongo telemetry.
- React + Vite frontend with lesson rendering and Pyodide execution.
