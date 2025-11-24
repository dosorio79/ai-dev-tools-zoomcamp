# OpenAPI Notes

This document stores notes for constructing the OpenAPI 3.1 spec.

---

## 1. Data Types to Define
- GameState
- User
- AuthToken or Session object
- LeaderboardEntry
- WatchingFrame

---

## 2. Open Questions
- What shape does watching feed need?
- Should failures return error codes or objects?
- Should session be cookie or bearer token?

---

## 3. TODO
- Extract exact request/response shapes from mock API usage
- Validate with frontend before generating backend
