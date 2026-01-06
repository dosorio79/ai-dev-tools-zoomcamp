# uLearn Frontend

React + TypeScript frontend for the uLearn micro-learning experience. The UI uses a mocked API client that matches the backend contract in `openapi.yaml`.

## Requirements

- Node.js 18+

## Local development

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173 by default.

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
