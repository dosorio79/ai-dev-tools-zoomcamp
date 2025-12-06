# 📘 CodeCollab — Collaborative Coding Interview Platform

A modern, real-time coding interview platform inspired by CoderPad & CodeSignal.  
Built for the **AI Dev Tools Zoomcamp** using:

- ⚛️ React + Vite frontend  
- 🛰️ Express + WebSockets backend  
- 🔌 In-browser execution (JS sandbox + Python via Pyodide)  
- 👥 Live presence & synchronized editing  

Fast, lightweight, zero cloud dependencies.

---

## 🚀 Features

- Real-time collaborative code editor  
- Live user presence (join/leave indicators)  
- JavaScript execution sandbox (browser)  
- Python execution via Pyodide (WASM)  
- WebSocket-driven code + language sync  
- Shareable session links  
- Zero backend persistence (ephemeral sessions)

---

## 📁 Repository Structure

```
02-coding_platform/
├── frontend/        # Vite + React UI
├── backend/         # Express API + WebSockets
├── docs/            # System design, APIs, runtime, deployment
├── openapi/         # OpenAPI specification
├── AGENTS.md        # Contributor & AI assistant playbook
└── package.json     # Dev scripts (root)
```

### Quick Summary

- **frontend/** → collaborative editor, Pyodide runner, presence, UI  
- **backend/** → sessions API, WS events, in-memory session store  
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
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend (REST) | http://localhost:8000 |
| WebSockets | ws://localhost:8000/ws/{sessionId} |

REST base path: `/sessions/*` (or `/api/sessions/*` when frontend is served by the backend).

Enable mock API mode:
```bash
VITE_USE_MOCK_API=true
```

---

## 🐳 Docker & Deployment

### **Local Development — Docker Compose (recommended for dev)**
Runs **two containers**:

- `frontend` → Vite dev server (hot reload)  
- `backend`  → Node/Express + WS (auto-reload)  

```bash
docker compose up --build
```

Uses:
- `Dockerfile.dev.frontend`
- `Dockerfile.dev.backend`

---

### **Production — Render Single Container**
Render prefers a **single Web Service** (free tier friendly). Use `Dockerfile.render` only for Render (or to mimic that layout locally):

1. Builds frontend → `/dist` with `VITE_API_BASE_URL=/api` and same-origin WebSockets baked in.  
2. Builds backend → `/dist`.  
3. Copies frontend `/dist` into backend `/static`.  
4. Backend serves:
   - `/` → index.html  
   - `/api/*` → REST  
   - `/ws/*` → WebSockets  
5. Runs on `$PORT` (Render injects this; defaults to 8000 when not set).

No CORS. No reverse proxy. One container, one origin.

---

## 🔌 API Overview (High-Level)

### REST
- `POST /sessions` → create session  
- `GET /sessions/{id}` → fetch session  
- `POST /sessions/{id}/join` → join with username  
- `GET /sessions/{id}/users` → list connected users  
- `PUT /sessions/{id}/code` → update shared code  
- `PUT /sessions/{id}/language` → switch language  
- `POST /sessions/{id}/execute` → mocked execution  
- `POST /sessions/{id}/leave` → leave session  
Base paths: `/sessions/*` locally; `/api/sessions/*` when served from the same origin as the frontend.

### WebSocket Events
- `code_change`  
- `user_joined` / `user_left`  
- `language_change`  
- `execution_result`  

Everything defined in `openapi/openapi.yaml`.

---

## 🧩 Frontend Architecture

- **Zustand** store (`interviewStore.ts`) manages session state  
- **WebSocket hooks** propagate live events  
- **Pyodide** loads once → Python runs in your browser  
- **JS sandbox** executes JavaScript safely  
- **Editor** updates propagate instantly through WebSockets  
- **Mock API** available for testing  

---

## 📚 Documentation

Start here:

- `docs/SYSTEM_DESIGN.md` — system architecture  
- `docs/API_REST.md` + `docs/API_WEBSOCKETS.md` — API contracts  
- `docs/RUNTIME_WASM.md` — JS sandbox + Pyodide execution  
- `docs/DEPLOYMENT.md` — Docker Compose + Render deployment  

---

## ⚠️ Known Limitations

- In-memory session store → restart wipes state  
- Backend does not execute user code; execution stays in the browser (JS sandbox/Pyodide) and results are just relayed  
- No authentication/roles (by design for the Zoomcamp)  
- Not intended as a multi-tenant production SaaS  

---

## 🤝 Contributing

Read:

```
AGENTS.md
```

Includes:
- task boundaries  
- internal architecture rules  
- AI-assistant coding patterns  
- file placement conventions  

---

## 📄 License

MIT License (or project default).

---

Made with ❤️ for AI Dev Tools Zoomcamp.
