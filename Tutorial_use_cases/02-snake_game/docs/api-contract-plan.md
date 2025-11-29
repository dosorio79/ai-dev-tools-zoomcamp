# API Contract Plan (Pre-OpenAPI)

This document defines the expected API contract based on the existing frontend mock API.
It is the intermediate step before producing the full OpenAPI 3.1 specification.

The goal is to translate frontend interactions into backend REST endpoints with clear
request/response structures.

---

# 1. Entities (Derived from Mock API)

## User
- id: string
- username: string
- email: string

## LeaderboardEntry
- id: string
- username: string
- score: number
- mode: "pass-through" | "walls"
- date: string (ISO datetime)

## LiveGame
- id: string
- username: string
- currentScore: number
- mode: "pass-through" | "walls"
- startedAt: string (ISO datetime)

---

# 2. Auth Request Bodies

## LoginRequest
- email: string
- password: string

## SignupRequest
- email: string
- username: string
- password: string

---

# 3. Leaderboard Request Bodies

## SubmitScoreRequest
- score: number
- mode: "pass-through" | "walls"

---

# 4. Frontend Mock API → Backend REST Endpoints Mapping

This table documents how current frontend mock functions must translate into backend REST endpoints.

## AUTH

| Mock Function | Backend Endpoint | Method | Input | Output |
|---------------|-----------------|--------|-------|--------|
| login(email, password) | `/auth/login` | POST | `{ email, password }` | `{ user, access_token }` |
| signup(email, username, password) | `/auth/signup` | POST | `{ email, username, password }` | `{ user, access_token }` |
| logout() | `/auth/logout` | POST | none | `{ success: true }` |
| getCurrentUser() | `/auth/me` | GET | auth token | `User` |

---

## LEADERBOARD

| Mock Function | Backend Endpoint | Method | Input | Output |
|---------------|-----------------|--------|-------|--------|
| getTopScores(mode?) | `/leaderboard` | GET | `?mode=pass-through|walls` | `LeaderboardEntry[]` |
| getUserScore(userId) | `/leaderboard/{userId}` | GET | `userId` (path) | `LeaderboardEntry` or 404 |
| submitScore(score, mode) | `/leaderboard` | POST | `{ score, mode }` | `201 Created` |

---

## LIVE GAMES (Watching Mode)

| Mock Function | Backend Endpoint | Method | Input | Output |
|---------------|-----------------|--------|-------|--------|
| getLiveGames() | `/live-games` | GET | none | `LiveGame[]` |
| getGameById(id) | `/live-games/{id}` | GET | `gameId` (path) | `LiveGame` or 404 |

---

# 5. Notes for OpenAPI Spec Generation

- Auth model still needs to be decided (JWT recommended).
- Error responses need to be standardized:
  - `400 Bad Request`
  - `401 Unauthorized`
  - `404 Not Found`
- Timestamp format should use ISO 8601.
- All enums must be explicitly defined in the OpenAPI schema.
- Leaderboard POST should return 201 Created with either:
  - the created entry, or
  - an empty body

---

# 6. Next Step

Use this mapping to generate the full OpenAPI 3.1 specification (`openapi/api.yaml`),
which will be used to scaffold the FastAPI backend.
