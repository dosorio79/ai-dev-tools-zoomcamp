<!-- AI / agent governance rules  -->

# AGENTS.md

This repository may be used with AI coding assistants or agent-based tools.

## General rules
- Do not modify the OpenAPI contract (`openapi.yaml`) without explicit instruction.
- Do not introduce new endpoints beyond `/lesson` and `/health`.
- Do not add authentication or user management logic.
- Do not add background workers, message queues, or microservices.

## Code structure
- Business logic must live in `app/services/`.
- AI agent logic must live in `app/agents/`.
- API routes must remain thin and delegate to services.
- MongoDB access must be centralized in `app/services/mongo.py`.

## Scope constraints
- The system generates a single 15-minute lesson per request.
- The system is stateless from a user perspective.
- Persistence is limited to append-only telemetry logging.

## Testing
- New functionality must include unit tests.
- Changes affecting `/lesson` must include API or integration tests.

## Out of scope
- User authentication
- Persistent user sessions
- Lesson personalization
- Exercise grading
