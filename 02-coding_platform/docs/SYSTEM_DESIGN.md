# System Design

This document describes the architecture of the collaborative coding interview application.  
The platform uses a React frontend, an Express + WebSocket backend, and an in-memory session store.  
All code execution happens in the browser.

No authentication or database is required.

---

# High-Level Architecture

=================================================================
                   COLLABORATIVE CODING PLATFORM
=================================================================

  +-----------------------+      REST       +---------------------+
  |        Frontend       | <------------>  |       Backend       |
  |  React + Vite + WS    |                 |  Express + WS       |
  |-----------------------|   WebSockets    |---------------------|
  | - Code editor (CM6)   | <============>  | - WS relay          |
  | - Run panel (JS/Py)   |                 | - REST API          |
  | - Session manager     |                 | - In-memory store   |
  | - Participants panel  |                 |                     |
  +----------+------------+                 +----------+----------+
             |                                         |
             |                                         v
             |                              +----------------------+
             |                              |   Session Store      |
             v                              |    (In Memory)       |
  +----------------------+                   |----------------------|
  |  Browser Execution   |                   | - sessionId          |
  |----------------------|                   | - code               |
  | - JS sandbox         |                   | - language           |
  | - Pyodide (WASM)     |                   | - participants       |
  +----------------------+                   | - cursors            |
                                             +----------------------+

=================================================================
                  NOTE: Code executes ONLY in the browser.
=================================================================

---

# Components

## 1. Frontend (React + Vite)

Responsibilities:
- Create and join sessions
- Connect to WebSockets
- Synchronize code + cursor updates
- Track participants
- Execute code locally (JS + Pyodide)
- Render the UI (Lovable-generated)

Key UI parts:
- Code editor (CodeMirror 6)
- Run panel (JS/Python execution)
- Participants panel
- Session creation/join UI
- Collaboration context (CollabContext)
- Execution utilities (pythonRunner, getExecutionEngine)

---

## 2. Backend (Express + WebSockets)

Responsibilities:
- Provide session creation API
- Provide session lookup API
- Handle WebSocket connections
- Relay real-time events to all clients
- Maintain in-memory session objects

Backend does **not**:
- Run code
- Store persistent data
- Authenticate users

---

## 3. In-Memory Session Store

The backend keeps session data in RAM.

Below is a JSON-style example using **~~~ fenced code** to avoid breaking the document:

~~~json
{
  "session123": {
    "code": "",
    "language": "javascript",
    "participants": {
      "Daniel": { "cursor": { "line": 1, "column": 2 } },
      "User2": { "cursor": { "line": 4, "column": 10 } }
    },
    "createdAt": "2025-11-27T15:00:00.000Z"
  }
}
~~~

Properties:
- `code`: current shared code
- `language`: editor mode
- `participants`: active users + cursor positions
- `createdAt`: timestamp of session creation

State is **ephemeral** and acceptable for coursework.

---

# WebSocket Event Flow

### 1. join
Sent by a client when entering a session.
~~~json
{ "type": "join", "name": "Daniel" }
~~~

### 2. code_change
Client edits code.
~~~json
{ "type": "code_change", "code": "...", "cursor": { "line": 3, "column": 12 } }
~~~

### 3. cursor_change
Cursor moved without changing code.
~~~json
{ "type": "cursor_change", "cursor": { "line": 6, "column": 5 } }
~~~

### 4. presence_update
Sent by backend when participants join/leave.
~~~json
{ "type": "presence_update", "participants": ["Daniel", "User2"] }
~~~

Optional events:
- `language_change`
- `execution_result` (if broadcast to other users)

---

# Data Flow Summary

1. User creates a session → backend returns `{ sessionId }`
2. User opens session URL → WebSocket connection established
3. User picks a name → frontend sends `join`
4. Edits and cursor changes flow through WS
5. Code is executed **locally** (JS + Pyodide)

---

# Design Principles

- **Real-time first**: WebSocket broadcast architecture
- **Safe**: No server-side code execution
- **Simple**: In-memory store only
- **Stateless REST**: no auth required
- **All execution stays in browser**
- **Frontend + backend run in one Docker container for deployment**

