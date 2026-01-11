# Agent Architecture

## Overview

The backend generates a single 15-minute lesson per request using three cooperating agents. Each agent is narrow in scope and produces structured outputs that are combined into the response defined in `openapi.yaml`.

The system is stateless from a user perspective. Persistence is limited to append-only telemetry logging in MongoDB.

## Agents and responsibilities

- PlannerAgent: Creates the lesson outline, section titles, and time budget per section.
- ContentAgent: Generates Markdown content for each planned section.
- ValidatorAgent: Ensures the total lesson time is 15 minutes (currently by adjusting section minutes).

## Orchestration flow

1) Receive `POST /lesson` request.
2) Planner produces a structured plan (sections with minute budgets).
3) Content agent expands each section into Markdown.
4) Validator confirms constraints (15 minutes total).
5) Persist telemetry (request metadata + output summary).
6) Return the final `LessonResponse`.

## Error handling

- Validation is currently best-effort and adjusts section minutes; it does not reject requests.
- Generation errors would return a 500 error and are logged for telemetry.
- No retries or background processing are used.

## Data contracts

All external contracts are defined in `openapi.yaml`. Internal models align with:

- `app/models/api.py` for request/response schema mapping.
- `app/models/db.py` for telemetry documents.

## Constraints

- Only `/lesson` and `/health` endpoints are supported.
- No authentication, personalization, or user sessions.
- No background jobs, queues, or microservices.
