# CodeCollab Interview Platform – Backend

Express + TypeScript service that implements the REST and WebSocket APIs described in `openapi/openapi.yaml` for the real-time collaborative coding interview platform.

## Stack
- Express 4, TypeScript, ws (WebSocket)
- In-memory session store (no persistence)
- Vitest + Supertest for API tests

## Development
```bash
# install deps
cd backend
npm install

# typecheck/build
npm run build

# run tests (Vitest, node env)
npm test

# start dev server (TS via nodemon/ts-node)
npm run dev
```

Server defaults to `PORT=8000` (overridable via `PORT`, e.g., Render provides this). REST routes mount under `/sessions` (with `/api/sessions` available for production/static hosting), and WebSocket upgrades live at `/ws/{sessionId}`.

## API (high level)
- `POST /sessions` – create session (optional `language`), returns Session (id, createdAt, code, language).
- `GET /sessions/{sessionId}` – fetch session.
- `POST /sessions/{sessionId}/join` – join with `userName`, returns `{ session, user }`.
- `GET /sessions/{sessionId}/users` – list users.
- `PUT /sessions/{sessionId}/code` – update `code` (204).
- `PUT /sessions/{sessionId}/language` – change `language` (204).
- `POST /sessions/{sessionId}/execute` – mock execution; broadcasts `execution_result`.
- `POST /sessions/{sessionId}/leave` – remove user (204).
- WebSocket: connect to `/ws/{sessionId}` to receive `code_change`, `user_joined`, `user_left`, `language_change`, `execution_result` events.

See `openapi/openapi.yaml` for full request/response schemas.
