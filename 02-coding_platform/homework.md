## Prompts

Create a frontend UI for a real-time collaborative coding interview platform.

# Features (Frontend Only, Backend Mocked)
- Page to create a new interview session (mock the session creation)
- Page for joining a session via URL
- Collaborative code editor panel
- Mocked real-time updates (simulate WebSocket events)
- Syntax highlighting for JavaScript and Python
- Execute button with mocked output (for now)
- Show a mock list of connected users ("presence")
- Clean UI with React + Vite + TypeScript

# Critical Requirements
- DO NOT implement a real backend.
- DO NOT create real WebSocket connections.
- All API and WebSocket interactions MUST be mocked.
- Centralize all mocked API and WebSocket calls in a single file (e.g., src/api/mockApi.ts).
- Include unit tests (Vitest + React Testing Library).

# Project Structure
- Keep frontend self-contained and ready for later integration.
- Use components and hooks cleanly.
- Use a single state management strategy (React Context or Zustand).

# Goal
Produce a clean, working, testable UI with fully mocked behavior that I can later connect to a real Express.js + WebSocket backend.


# openAPI specificationgeneration
- Based on the React frontend and its src/api/mockApi.ts file, generate a complete OpenAPI 3.1 specification for the real backend.
- Extract all endpoints, request bodies, response bodies, and error cases directly from the mockApi design.
- Output a single OpenAPI YAML file with info, servers, paths, and components.

# Scaffold the backend
Using the OpenAPI file at openapi/openapi.yaml  
and the behaviors defined in frontend/src/api/mockApi.ts,  
scaffold a real backend in Express.js with:

- routes per tag
- TypeScript support
- controllers for each endpoint
- in-memory stores identical to mockApi behavior
- WebSocket server for collaborative code updates
- validation generated from the OpenAPI schemas
- a clean folder structure: /routes /controllers /services /models /ws
- basic integration tests (Vitest + Supertest) covering the main REST flows defined in the OpenAPI spec

Do NOT invent new endpoints.
Do NOT modify the OpenAPI spec.

Only scaffold: create empty functions with typed signatures.
