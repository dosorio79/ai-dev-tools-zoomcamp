# uLearn Frontend

React + TypeScript frontend for the uLearn micro-learning experience. The UI uses a mocked API client that matches the backend contract in `openapi.yaml`.

## Requirements

- Node.js 18+

## Local development

```bash
npm install
npm run dev
```

The app runs at http://localhost:8080 by default.

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

## Mocked API

The mock client lives in `src/api/lessonClient.ts`. Components must consume the client and should not call the backend directly.
