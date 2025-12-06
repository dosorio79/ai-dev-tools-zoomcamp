# 📘 CodeCollab — Collaborative Coding Interview Platform

A modern, real-time coding interview platform inspired by CoderPad & CodeSignal.  
Built for the **AI Dev Tools Zoomcamp** using:

- ⚛️ React + Vite frontend  
- 🛰️ Express + WebSockets backend  
- 🔌 In-browser execution (JS sandbox + Python via Pyodide)  
- 👥 Live presence & synchronized editing  
- 🐳 Fully containerized for local dev & production deployment  

Fast, lightweight, zero cloud dependencies — **everything runs client-side or in your container**.

---

## 🚀 Features

- Real-time collaborative code editor  
- Live user presence (join/leave indicators)  
- JavaScript execution sandbox (browser)  
- Python execution via Pyodide (WASM)  
- WebSocket-driven code + language sync  
- Shareable session links  
- Ephemeral sessions (stateless backend)  
- Simple, transparent architecture suitable for learning & extending  

---

## 📁 Repository Structure

### Directory Layout

    02-coding_platform/
    ├── frontend/        # Vite + React UI
    ├── backend/         # Express API + WebSockets
    ├── docs/            # System design, APIs, runtime, deployment
    ├── openapi/         # OpenAPI specification
    ├── AGENTS.md        # Contributor & AI assistant playbook
    └── package.json     # Dev scripts (root)

### Summary

- **frontend/** → collaborative editor, Pyodide runner, presence, UI  
- **backend/** → session API, WS events, in-memory session store  
- **docs/** → source of truth for architecture & flows  
- **openapi/** → REST + WebSocket definitions  

---

## 🧪 Quick Start (Development)

### 1. Install root tooling
```bash
npm install
```

### 2. Install service dependencies
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. Run both (via concurrently)
```bash
npm run dev
```

### Local URLs

| Service | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| WebSockets | ws://localhost:8000/ws/{sessionId} |

REST base: `/sessions/*` locally; `/api/sessions/*` when frontend is served by backend.

Enable mock API mode:
```bash
VITE_USE_MOCK_API=true
```

---

## 🐳 Docker & Deployment

### Local Dev — Docker Compose

Runs with **two containers**, hot-reloaded:

- `frontend` → Vite dev server  
- `backend` → Express + WebSockets  

```bash
docker compose up --build
```

Uses:

- `Dockerfile.dev.frontend`  
- `Dockerfile.dev.backend`  

---

### Production — Render (Single Container)

Render uses `Dockerfile.render` to build a **single Web Service**:

1. Builds frontend → `/dist`  
2. Builds backend → `/dist`  
3. Copies frontend `/dist` to backend `/static`  
4. Backend serves:  
   - `/` → frontend  
   - `/api/*` → REST  
   - `/ws/*` → WebSockets  
5. Runs on **Render-injected `$PORT`** (defaults to 8000 locally)

**One origin. No CORS. No proxy. No extra config.**

---

## 🔌 API Overview (High-Level)

### REST Endpoints

- `POST /sessions` — create session  
- `GET /sessions/{id}` — fetch session  
- `POST /sessions/{id}/join` — join with username  
- `GET /sessions/{id}/users` — list connected users  
- `PUT /sessions/{id}/code` — update shared code  
- `PUT /sessions/{id}/language` — switch language  
- `POST /sessions/{id}/execute` — mocked execution relay  
- `POST /sessions/{id}/leave` — leave session  

### WebSocket Events

- `code_change`  
- `user_joined` / `user_left`  
- `language_change`  
- `execution_result`  

Everything defined in `openapi/openapi.yaml`.

---

## 🧩 Frontend Architecture

- **Zustand** for session state  
- **Custom WebSocket hooks** for syncing  
- **Pyodide** for browser-based Python  
- **Sandboxed JS runner**  
- **Code editor** mirrored across clients  
- **Mock API** mode for offline development  

---

## 🧭 Intentional Design Decisions

### 1. Ephemeral In-Memory Session Store

Chosen because:

- Sessions are short-lived  
- No database complexity needed  
- Produces clean, predictable state  
- Ideal for demos, interviews, and course work  

### 2. Client-Side Execution (JS Sandbox + Pyodide WASM)

All execution happens in-browser:

- Complete sandboxing  
- Zero backend compute load  
- Python (WASM) with no server runtime  
- Horizontal scalability “for free”  
- Same behavior everywhere  

Similar to modern interview platforms that isolate execution from backend infra.

### 3. Stateless Backend

Backend coordinates users and events but executes **no code**:

- Easy to deploy  
- Easy to scale  
- Clean single-container deployment  

### 4. One-Origin Deployment

Frontend + backend share one domain:

- No CORS issues  
- WebSockets work reliably  
- Simpler operational setup  
- Perfect for Render deployment  

---

## 📚 Documentation

- `docs/SYSTEM_DESIGN.md` — core architecture  
- `docs/API_REST.md` + `docs/API_WEBSOCKETS.md` — contracts  
- `docs/RUNTIME_WASM.md` — JS sandbox + Pyodide  
- `docs/DEPLOYMENT.md` — Docker Compose + Render docs  

---

## 🤝 Contributing

See `AGENTS.md` for:

- Architectural rules  
- Contribution workflow  
- AI assistant conventions  
- File placement guidelines  

---

## 📄 License

MIT License (or project default)

---

Made with ❤️ for **AI Dev Tools Zoomcamp**, blending full-stack engineering with modern in-browser compute (Pyodide + JS sandbox).
