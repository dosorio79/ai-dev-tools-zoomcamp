# uLearn Frontend

React + TypeScript frontend for the uLearn micro-learning experience. The UI calls the backend API defined in `openapi.yaml`.

## Requirements

- Node.js 18+

## Local development

```bash
npm install
npm run dev
```

The app runs at http://localhost:8080 by default.

To point the frontend at a different backend, set `VITE_API_BASE` at build time via `frontend/.env`:

```
VITE_API_BASE=http://localhost:8000
```

## Python execution (Pyodide)

Python code blocks include a Run button that executes the snippet in the browser using Pyodide and displays stdout output. If there is no output, the UI suggests adding a `print(...)` statement.

You can override the Pyodide base URL with `VITE_PYODIDE_BASE` (defaults to the jsDelivr CDN).

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## API client

The client lives in `src/api/lessonClient.ts`. Components must consume the client and should not call the backend directly.

Note: The Docker Compose setup serves a prebuilt static bundle; `VITE_API_BASE` must be set before building the frontend.
