# Frontend

## Overview

The frontend is a React + TypeScript application built with Vite and styled with Tailwind CSS. It renders lessons by calling the backend API that follows `openapi.yaml`.

## Architecture

- `src/api/lessonClient.ts`: API client returning `LessonResponse`.
- `src/api/executeLocally.ts`: In-browser execution for Python snippets using Pyodide.
- `src/types/lesson.ts`: Request/response types aligned with OpenAPI.
- `src/types/execution.ts`: Execution types for local snippet runs.
- `src/pages/Home.tsx`: Input flow, loading state, and lesson rendering.
- `src/components/LessonRenderer.tsx`: Overall lesson layout.

Environment configuration:

- `VITE_API_BASE`: backend base URL (defaults to `http://localhost:8000`)
- `frontend/public/runtime-config.js`: optional runtime override for `API_BASE`
- `src/components/LessonSection.tsx`: Per-section rendering.
- `src/components/CodeBlock.tsx`: Markdown code blocks with syntax highlighting.
- `src/components/ExerciseBlock.tsx`: Custom `:::exercise` block rendering.

## Python execution (Pyodide)

Python code blocks include a Run button that executes the snippet in the browser using Pyodide. The UI shows stdout output or provides a hint if no output is produced.

Set `VITE_PYODIDE_BASE` to override the default Pyodide CDN base URL (defaults to the jsDelivr CDN).

## Mocked API

The client generates a realistic lesson response for testing. Components must consume the client and should not call the backend directly.

## Local development

```bash
cd frontend
npm install
npm run dev
```

The app runs at http://localhost:8080 by default.

UI notes:
- Loading uses elapsed-time phases with a slim progress bar.
- Home includes a short hero subline, a “Why it works” mini-row, and footer links.
- Exercise blocks render from `:::exercise` fences (`:::exercise` + content + `:::`).
- The loading bar shows elapsed seconds and the UI surfaces errors via a toast.
- Sections include chip headers with copy actions; full lesson export is available.

Set `VITE_API_BASE` in `frontend/.env` to change the backend URL (defaults to `http://localhost:8000`).
The runtime config (`frontend/public/runtime-config.js`) can override this without a rebuild:
- `API_BASE: ""` uses same-origin (recommended for Docker with nginx proxy).
- `API_BASE: "http://localhost:8000"` calls the backend directly.

## Deployment note

The frontend is packaged as a static build and served from its own container in Docker Compose.

The container serves the static UI at http://localhost:8080.

The nginx container also proxies `/lesson` and `/health` to the backend service, so
you can set `API_BASE` to an empty string in `frontend/public/runtime-config.js` to use
same-origin requests in Docker.

For Docker deployments, you can also edit `frontend/public/runtime-config.js` (or mount
it as a volume) to set `API_BASE` at runtime without rebuilding.

## Tests

```bash
cd frontend
npm test
```
