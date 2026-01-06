# Frontend

## Overview

The frontend is a React + TypeScript application built with Vite and styled with Tailwind CSS. It renders lessons using a mocked API client that follows `openapi.yaml`.

## Architecture

- `src/api/lessonClient.ts`: Mocked API client returning `LessonResponse`.
- `src/types/lesson.ts`: Request/response types aligned with OpenAPI.
- `src/pages/Home.tsx`: Input flow, loading state, and lesson rendering.
- `src/components/LessonRenderer.tsx`: Overall lesson layout.
- `src/components/LessonSection.tsx`: Per-section rendering.
- `src/components/CodeBlock.tsx`: Markdown code blocks with syntax highlighting.
- `src/components/ExerciseBlock.tsx`: Custom `:::exercise` block rendering.

## Mocked API

The client generates a realistic lesson response for testing. Components must consume the client and should not call the backend directly.

## Local development

```bash
cd frontend
npm install
npm run dev
```

The app runs at http://localhost:5173 by default.

## Deployment note

The frontend is packaged as a static build and served from its own container in Docker Compose. It still uses the mocked API client until the backend integration is enabled.

The container serves the static UI at http://localhost:8080.

## Tests

```bash
cd frontend
npm test
```
