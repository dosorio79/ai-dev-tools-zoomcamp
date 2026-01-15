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

## Deployment note

The frontend is packaged as a static build and served from its own container in Docker Compose.

The container serves the static UI at http://localhost:8080.

## Tests

```bash
cd frontend
npm test
```
