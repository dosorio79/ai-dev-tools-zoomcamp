# WebSocket API Specification

This document defines the WebSocket protocol used for real-time collaboration  
in the coding interview platform.

While the REST API provides session creation, all **live collaboration**, including:

- code editing
- cursor movement
- participant join/leave notifications
- code execution results  
- language changes  
- chat (optional)

is transmitted through WebSockets.

---

# Connection URL

For local development:

    ws://localhost:8000/ws/<sessionId>

For deployment:

    wss://<your-deployment>/ws/<sessionId>

Frontend should prefer constructing the URL from the current host to work in both environments:

    new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/<sessionId>`)

### Example

    ws://localhost:8000/ws/abc123

Backend should:
- Accept the WebSocket connection
- Associate the socket with `sessionId`
- Keep a lightweight in-memory map of connected clients

---

# Message Format

All WebSocket messages follow a unified envelope structure:

    {
      "type": "<event-type>",
      "payload": { ... }
    }

### Example:

    {
      "type": "cursor-move",
      "payload": {
        "userId": "user-xyz",
        "cursor": { "line": 5, "column": 12 }
      }
    }

---

# Event Types

Below is the complete list of events the backend should handle.

Events are categorized into:

1. **Client → Server**
2. **Server → Clients**

---

# 1. Client → Server Events

## join-session

Sent immediately when a user opens the page.

    {
      "type": "join-session",
      "payload": {
        "userId": "user-123",
        "username": "Alice"
      }
    }

## leave-session

Sent when the user closes the tab (or disconnects unexpectedly).

    {
      "type": "leave-session",
      "payload": { "userId": "user-123" }
    }

## code-change

Sent whenever code is edited.

    {
      "type": "code-change",
      "payload": {
        "userId": "user-123",
        "changes": "<raw-diff-or-full-code>"
      }
    }

Frontend can send:
- Full code text  
- A diff  
- A patched value

Either is allowed — AI implementation decides.

## cursor-move

    {
      "type": "cursor-move",
      "payload": {
        "userId": "user-123",
        "cursor": { "line": 4, "column": 10 }
      }
    }

## language-change

    {
      "type": "language-change",
      "payload": {
        "userId": "user-123",
        "language": "python"
      }
    }

## execute-code

Client asks the browser-side WASM runtime to execute code.

    {
      "type": "execute-code",
      "payload": {
        "language": "python",
        "code": "print(1 + 1)"
      }
    }

Backend usually **does NOT execute code**.  
It only forwards the request to others if needed.

---

# 2. Server → Clients Events

These events are broadcast to all participants in the session.

## participant-joined

    {
      "type": "participant-joined",
      "payload": {
        "userId": "user-123",
        "username": "Alice"
      }
    }

## participant-left

    {
      "type": "participant-left",
      "payload": { "userId": "user-123" }
    }

## code-update

When one client edits code, all others receive this:

    {
      "type": "code-update",
      "payload": {
        "userId": "user-123",
        "code": "<updated-full-code>"
      }
    }

## cursor-update

    {
      "type": "cursor-update",
      "payload": {
        "userId": "user-123",
        "cursor": { "line": 4, "column": 10 }
      }
    }

## language-updated

    {
      "type": "language-updated",
      "payload": {
        "userId": "user-123",
        "language": "javascript"
      }
    }

## execution-result

Browser-side WASM runtime sends the output back:

    {
      "type": "execution-result",
      "payload": {
        "output": "2\n",
        "error": null
      }
    }

---

# Error Messages

If something goes wrong:

    {
      "type": "error",
      "payload": {
        "message": "Invalid message type"
      }
    }

---

# Summary Table

| Event | Direction | Description |
|-------|-----------|-------------|
| join-session | C → S | User joins session |
| leave-session | C → S | User leaves |
| code-change | C → S | Send code edits |
| cursor-move | C → S | Send cursor movements |
| language-change | C → S | Change language |
| execute-code | C → S | Ask frontend to run code |
| participant-joined | S → C | Notify when new user joins |
| participant-left | S → C | Notify on disconnect |
| code-update | S → C | Broadcast new code |
| cursor-update | S → C | Broadcast cursor changes |
| language-updated | S → C | Broadcast language selection |
| execution-result | S → C | Send back WASM execution |

---

# Notes for Implementation

- Messages should be kept small and debounced (frontend responsibility).
- Server should be **stateless except for in-memory session data**.
- If the server restarts, the session resets — acceptable for homework.
- No authentication is required.
- No code is executed on the server for security.
