# Project Overview

This project implements a **real-time collaborative coding interview platform**, similar to CoderPad, CodeSignal, or HackerRank Interviews.

The platform allows multiple participants (interviewer and candidate) to:

- Create and share a collaborative coding session link
- Edit code together in real time
- View each other’s cursor positions and presence
- Switch between supported programming languages (JavaScript and Python)
- Run code safely in the browser using WASM-based execution
- Track connected participants in real time

## Architecture Summary

The application consists of:

### **Frontend (React + Vite + Lovable-generated UI)**
- Code editor using CodeMirror 6
- Real-time updates using WebSockets
- Mock API (to be replaced with real backend)
- Browser-side code execution (JS + Pyodide for Python)
- UI features such as session manager, participants panel, run panel, etc.

### **Backend (Express.js + WebSockets)**
- REST API for session creation and retrieval
- WebSocket server for real-time collaboration and presence
- In-memory session store (later replaceable with Redis)

### **Execution Engine**
- JavaScript executed in a browser sandbox
- Python executed with Pyodide (WebAssembly)

This architecture ensures all code execution is safe and isolated in the client browser.

## Development Flow (Mirrors the Snake Game Project)
1. Build frontend first (Lovable)
2. Define REST + WebSocket API contracts
3. Implement backend with Express.js
4. Write integration tests
5. Run frontend + backend concurrently
6. Containerize for deployment
7. Deploy to a managed hosting platform

This documentation set provides a clear scaffold for implementation and evaluation.
