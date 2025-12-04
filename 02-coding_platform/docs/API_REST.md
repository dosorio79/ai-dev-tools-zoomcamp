# REST API Specification

This document defines the REST API endpoints used by the coding interview application.  
The REST layer is intentionally small — it only manages session creation and retrieval.  
All collaborative behavior (editing, cursor changes, presence) happens through WebSockets.

No authentication or database is required.

---

# Base URL

For local development:

    http://localhost:8000

For deployment:

    https://<your-deployment>/api

(If you choose to prefix with `/api`, all endpoints below use that prefix.)
The backend currently exposes both `/sessions/*` and `/api/sessions/*`; frontend clients should prefer relative `/api` paths when served from the same origin.

---

# POST /session

Create a new collaborative coding session.

### Request  
No body required.

    POST /session

### Response

    {
      "sessionId": "abc123",
      "createdAt": "2025-11-27T15:00:00.000Z"
    }

### Notes
- `sessionId` is a random string (UUID, nanoid, or similar)
- Backend also initializes the in-memory entry for the session
- Frontend redirects the user to `/<sessionId>` or `/session/:sessionId`

---

# GET /session/:id

Retrieve metadata about a session before connecting to WebSockets.

### Example

    GET /session/abc123

### Response

    {
      "sessionId": "abc123",
      "language": "javascript",
      "code": "",
      "participants": [],
      "createdAt": "2025-11-27T15:00:00.000Z"
    }

### Notes
- Returns initial state only — real-time updates flow through WebSockets.
- Backend may auto-create sessions or return 404 (both acceptable designs).

---

# Summary Table

| Endpoint          | Method | Description                     |
|-------------------|--------|---------------------------------|
| `/session`        | POST   | Create a new session            |
| `/session/:id`    | GET    | Retrieve session metadata       |

---

# Error Handling

### 404 Not Found

    {
      "error": "Session not found"
    }

### 400 Invalid Session ID

    {
      "error": "Invalid session ID"
    }

---

# Example Workflow

1. Frontend calls `POST /session`
2. Backend returns JSON with a `sessionId`
3. Frontend navigates to `/session/:id`
4. Frontend calls `GET /session/:id`
5. Frontend connects to WebSocket endpoint `/ws/:sessionId`
6. Real-time collaboration begins

---

# Out-of-Scope Features (NOT required for Homework)

These are explicitly *not needed*:
- Authentication or user accounts
- Role-based access
- Persistent database
- Session expiration logic
- Code history tracking

The homework only requires a lightweight REST interface.
