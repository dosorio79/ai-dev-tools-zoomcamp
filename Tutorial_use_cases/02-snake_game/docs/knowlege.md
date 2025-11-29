# Module 2 — End-to-End Snake Game (Frontend-First + OpenAPI-First + FastAPI)

This file defines the overall scope and workflow for the project.  
It acts as the main “knowledge file” for AI assistants and for future development.

---

## 1. Objective
Build a complete end-to-end application using the workflow required by the AI Dev Tools Zoomcamp:

1. Frontend-first development (Lovable → React + TS)
2. Mock backend calls centralized in one file
3. Derive OpenAPI spec from frontend usage
4. Generate FastAPI backend from the spec
5. Implement logic + tests + database
6. Integrate frontend with typed client
7. Add CI (spec validation, FE tests, BE tests)
8. Add Docker Compose (frontend + backend + DB)

---

## 2. Functional Requirements

### Frontend
- Playable Snake game
- Two modes: pass-through and walls
- Login + Signup
- Display logged-in username
- Leaderboard
- Watching mode (simulated other players)
- All backend calls mocked first
- All logic covered by tests

### Backend
- OpenAPI 3.1 specification
- FastAPI backend generated from spec
- Mock DB → SQLite → Postgres
- Auth (token or session)
- Leaderboard endpoints
- Watching simulation endpoint
- Full testing:
  - Unit tests
  - Contract tests (vs spec)
  - Integration tests (SQLite)

### Deployment
- Deploy frontend + backend (Render, Vercel, Fly.io or Docker Compose)

---

## 3. Architecture Overview

### Frontend
- React + TypeScript + Vite + Tailwind
- Centralized mock API (src/api/index.ts)
- Tests with Vitest + React Testing Library

### OpenAPI
- Derived from FE mock calls
- Source of truth for backend + typed clients

### Backend
- FastAPI
- Generated stubs using openapi-generator or fastapi-codegen
- SQLAlchemy models
- uv dependency manager
- pytest test suite

### Docker
- frontend (static)
- backend (FastAPI)
- postgres

---

## 4. Constraints
- Do not implement backend before the OpenAPI spec.
- Do not build endpoints not in the spec.
- All API usage must go through one frontend API file.
- Database layer must be testable and isolated.
- CI must validate the spec + run all tests.

---

## 5. Definition of Done
- Fully working frontend
- Complete OpenAPI 3.1 spec
- FastAPI backend generated from spec
- Working DB migrations + queries
- FE/BE integration with typed client
- CI + Docker Compose working
