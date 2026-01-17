# Agent Architecture

## Overview

The backend generates a single 15-minute lesson per request using three cooperating agents. Each agent is narrow in scope and produces structured outputs that are combined into the response defined in `openapi.yaml`.

The system is stateless from a user perspective. Persistence is limited to append-only telemetry logging in MongoDB.

## Agents and responsibilities

- PlannerAgent: Creates the lesson outline, section titles, and time budget per section.
- ContentAgent: Generates structured content blocks for each planned section (stub).
- ContentAgentLLM: Optional LLM-backed content generator (toggle via `USE_LLM_CONTENT`).
- ValidatorAgent: Enforces structural guardrails (required section IDs, valid blocks, formatting rules, minimum minutes) and normalizes total time to 15 minutes.

Prompt sources:
- System prompt: `app/agents/prompts/content_llm_system.txt`
- User prompt template: `app/agents/prompts/content_llm_user.txt`
Prompt editing guidance: `docs/prompts.md`

## Orchestration flow

1) Receive `POST /lesson` request.
2) Planner produces a structured plan (sections with minute budgets).
3) Content agent generates structured blocks per section (selected via `USE_LLM_CONTENT`, model via `MODEL`).
4) Validator enforces structural rules (including required sections and formatting) and normalizes total time to 15 minutes.
5) Renderer converts blocks to Markdown for the API response.
6) Persist telemetry (request metadata + output summary) after validating the telemetry record.
7) Return the final `LessonResponse`.

## Error handling

- Validation raises `ValueError` for structural issues (empty content, duplicate IDs, too-short sections, impossible totals). These errors currently surface as 500s unless an API exception handler is added.
- Generation errors would return a 500 error and are logged for telemetry.
- No retries or background processing are used.

## Data contracts

All external contracts are defined in `openapi.yaml`. Internal models align with:

- `app/models/api.py` for request/response schema mapping.
- `app/models/db.py` for telemetry documents.
- `app/services/markdown_renderer.py` for block-to-Markdown rendering.

## Constraints

- Only `/lesson` and `/health` endpoints are supported.
- No authentication, personalization, or user sessions.
- No background jobs, queues, or microservices.

## Related references

- `docs/lesson-generation-poc.md` for prompt format experiments and validator rule candidates.
