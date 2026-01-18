# API Usage

## Overview

This document describes how to interact with the uLearn API. The single source of truth for request/response schemas is `openapi.yaml`.

## Base URL

- Local development: `http://localhost:8000`

## Endpoints

### POST /lesson

Generates a single 15-minute lesson for a topic and difficulty level.

Request body (`LessonRequest`):

- `session_id` (optional, UUID): Client-provided identifier for telemetry.
- `topic` (string, required): The learning topic.
- `level` (string, required): `beginner` or `intermediate`.

Response body (`LessonResponse`):

- `objective` (string): Learning objective summary.
- `total_minutes` (integer): Total duration (always 15).
- `sections` (array): Ordered lesson sections.

Each section contains:

- `id` (string)
- `title` (string)
- `minutes` (integer)
- `content_markdown` (string): Markdown-formatted content.

Example request:

```bash
curl -X POST http://localhost:8000/lesson \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "pandas groupby performance",
    "level": "intermediate"
  }'
```

Example response:

```json
{
  "objective": "Understand performance bottlenecks in pandas groupby operations.",
  "total_minutes": 15,
  "sections": [
    {
      "id": "concept",
      "title": "Concept",
      "minutes": 4,
      "content_markdown": "..."
    }
  ]
}
```

### GET /health

Simple health check endpoint.

Example request:

```bash
curl http://localhost:8000/health
```

Expected response: `200 OK`

## Error handling

- `400` for invalid requests or validation failures.
- `500` for generation errors.

Backend failures are logged to MongoDB failure telemetry for troubleshooting.

## Frontend note

The frontend calls the backend via `frontend/src/api/lessonClient.ts` and follows this contract.
