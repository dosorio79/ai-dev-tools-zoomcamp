# API Contract Plan (Pre-OpenAPI)

This file defines the expected entities and endpoints before writing the OpenAPI spec.

---

## 1. Entities

### User
- id
- username
- password_hash
- created_at

### GameSession
- id
- user_id
- mode ("pass-through" | "walls")
- score
- started_at
- ended_at

### WatchingSession
- id
- user_id
- moves: list of movement frames

---

## 2. Auth Endpoints
POST /signup  
POST /login  
GET /me  

---

## 3. Game Endpoints
POST /game/new  
POST /game/move  
POST /game/end  
GET /game/{id}

---

## 4. Leaderboard
GET /leaderboard

---

## 5. Watching
GET /watching  
GET /watching/{id}

---

## 6. Notes
- Final request/response bodies will be written in the OpenAPI 3.1 spec
- Backend must match these models exactly
