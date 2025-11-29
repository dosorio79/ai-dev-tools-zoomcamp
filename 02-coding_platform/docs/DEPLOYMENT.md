# Deployment Guide
Coding Interview Platform — Local Multiservice, Render Single-Container

This document explains the recommended deployment approach for the Coding
Interview Platform that maximizes simplicity and stability:

    LOCAL DEVELOPMENT  → Docker Compose (multi-service)
    PRODUCTION (RENDER) → Single container (backend + static frontend)

This maintains:
- fast, clean local development
- simple and reliable production deployment
- identical backend logic across environments
- one unified codebase

=====================================================================
1. Local Development Architecture (Docker Compose)
=====================================================================

Locally, you will run:

    docker-compose.yml
        ├── frontend: Vite dev server
        ├── backend: API + WebSockets (dev mode)
        └── optional: reverse proxy (nginx) for local HTTPS

This architecture gives:
- hot reloading in both services
- independent logs for debugging
- frontend served on port 5173
- backend served on port 8000
- no forced bundling during development

Local URLs:

    Frontend → http://localhost:5173
    Backend  → http://localhost:8000
    WebSockets → ws://localhost:8000/ws/<sessionId>

This is the cleanest approach for rapid iteration.

=====================================================================
2. Production Architecture (Render)
=====================================================================

Render prefers:
- one Web Service (Docker)
- one exposed port
- no multi-container deployments (unless using paid Blueprint tier)

Therefore, the final production deployment uses a single Docker image:

    final-image:
        ├── backend server (Express/FastAPI)
        ├── frontend /dist files copied into backend/static
        └── serves everything from port 8000

This eliminates:
- CORS configuration
- WebSocket cross-origin issues
- multiple Render services
- multi-container orchestration

Your Render URL:

    https://yourapp.onrender.com

serves both:
- frontend (static)
- backend API
- WebSockets (wss://yourapp.onrender.com/ws/<sessionId>)

=====================================================================
3. Local Docker Compose (Development Mode)
=====================================================================

Local file structure:

    /frontend
    /backend
    docker-compose.yml
    Dockerfile.render (for production image)
    Dockerfile.dev.frontend
    Dockerfile.dev.backend

Local command:

    docker compose up --build

This creates two real containers:
- changes in `/frontend` trigger live reload
- changes in `/backend` trigger autoreload (nodemon or uvicorn reload)

Local services are intentionally separated because:
- frontend dev server is FAST
- you get best DX (developer experience)
- no rebuild needed every time during development

=====================================================================
4. Render Deployment (Single Container)
=====================================================================

Render deploys using a dedicated production Dockerfile, such as:

    Dockerfile.render

This file:

1. Builds frontend → outputs `/dist`
2. Builds backend
3. Copies frontend `/dist` into backend's static directory
4. Runs backend server on `$PORT`

Render only needs:
- one Web Service
- one container
- one port

This works perfectly with:
- WebSockets
- static frontend hosting
- API endpoints
- HTTPS termination by Render

=====================================================================
5. Environment Variables
=====================================================================

Local mode:

    FRONTEND_URL=http://localhost:5173
    BACKEND_URL=http://localhost:8000

Render production:

    BACKEND_URL=""   (not needed—relative URLs)
    FRONTEND_URL=""  (not needed—single container serves everything)

All frontend code should use **relative API paths**:

    fetch("/api/sessions")

WebSockets:

    new WebSocket(`ws://${location.host}/ws/${sessionId}`)

Render automatically switches to `wss://`.

=====================================================================
6. Benefits of This Hybrid Approach
=====================================================================

LOCAL (multi-container)
- clean separation of concerns
- hot reloading everywhere
- fastest frontend development
- no bundling overhead
- true microservice feel

RENDER (single container)
- no CORS issues
- no proxying required
- no multiple Render services
- cheap/free tier compatible
- unified logging
- simpler health checks

This is the recommended approach used by:
- Next.js deployments with custom servers
- Node monolithic deployments
- FastAPI + static frontend deployments

=====================================================================
7. Summary
=====================================================================

Local:
- Two services (frontend + backend)
- Independent hot reload
- Easy debugging
- Compose-driven development

Production:
- One Docker image
- Backend serves static frontend
- WebSockets + API on one domain
- Zero configuration headaches

This setup is simple, robust, deployable, and fits perfectly with the
requirements of the AI Dev Tools Zoomcamp homework.
