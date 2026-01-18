"""Lesson service orchestration and telemetry logging."""

import logging
import os
from datetime import datetime, timezone
from typing import Mapping, Sequence
from uuid import uuid4

from pydantic import ValidationError

from app.models.api import LessonRequest, LessonResponse, LessonSection
from app.models.db import LessonRun, LessonFailure
from app.services.mongo import insert_lesson_run, insert_lesson_failure
from app.agents.planner import PlannerAgent
from app.agents.content import ContentAgent
from app.agents.content_llm import ContentAgentLLM
from app.agents.validator import ValidatorAgent
from app.services.markdown_renderer import render_blocks_to_markdown

logger = logging.getLogger(__name__)

# Feature flag to toggle between standard content agent and LLM-backed content agent
USE_LLM_CONTENT = os.getenv("USE_LLM_CONTENT", "false").lower() == "true"

# instantiate agents
planner_agent = PlannerAgent()
content_agent = ContentAgentLLM() if USE_LLM_CONTENT else ContentAgent()
validator_agent = ValidatorAgent()


"""Lesson service orchestration and telemetry logging."""

import logging
import os
from datetime import datetime, timezone
from uuid import uuid4

from pydantic import ValidationError

from app.models.api import LessonRequest, LessonResponse, LessonSection
from app.models.db import LessonRun
from app.services.mongo import insert_lesson_run
from app.agents.planner import PlannerAgent
from app.agents.content import ContentAgent
from app.agents.content_llm import ContentAgentLLM
from app.agents.validator import ValidatorAgent
from app.services.markdown_renderer import render_blocks_to_markdown

logger = logging.getLogger(__name__)

# Feature flag to toggle between standard content agent and LLM-backed content agent
USE_LLM_CONTENT = os.getenv("USE_LLM_CONTENT", "false").lower() == "true"

# instantiate agents
planner_agent = PlannerAgent()
content_agent = ContentAgentLLM() if USE_LLM_CONTENT else ContentAgent()
validator_agent = ValidatorAgent()


async def generate_lesson(request: LessonRequest) -> LessonResponse:
    """Generate a lesson using the agent pipeline and record telemetry."""
    session_id = str(request.session_id) if request.session_id else str(uuid4())

    def _summarize_schema_errors(errors: Sequence[Mapping[str, object]]) -> str:
        if not errors:
            return "Unknown schema validation error."
        first = errors[0]
        location = ".".join(str(part) for part in first.get("loc", [])) or "unknown"
        message = first.get("msg", "invalid value")
        return f"{location}: {message}"
    
    # create agentic pipeline
    # 1. planning
    planned_sections = planner_agent.plan(request.topic, 
                                          request.level, 
                                          )
    try:
        # 2. content generation
        generated_sections = await content_agent.generate(
            topic=request.topic,
            planned_sections=planned_sections,
        )
        # 3. validation
        validated_sections = validator_agent.validate(generated_sections)

        # create response
        response = LessonResponse(
            objective=f"Learn {request.topic} at a {request.level} level in 15 minutes.",
            total_minutes=15,
            sections=[
                LessonSection(
                    id=s.id,
                    title=s.title,
                    minutes=s.minutes,
                    content_markdown=render_blocks_to_markdown(s.blocks),
                ) for s in validated_sections
            ],
        )
    except ValidationError as exc:
        summary = _summarize_schema_errors(exc.errors())
        logger.error(
            "Lesson generation schema validation summary: %s",
            summary,
        )
        failure = LessonFailure(
            run_id=str(uuid4()),
            session_id=session_id,
            topic=request.topic,
            level=request.level,
            created_at=datetime.now(timezone.utc),
            error_type="schema_validation",
            error_message=summary,
            error_details=exc.errors(),
        )
        try:
            insert_lesson_failure(failure.to_mongo())
            logger.info(
                "Failure insert succeeded run_id=%s session_id=%s",
                failure.run_id,
                session_id,
            )
        except Exception as failure_exc:
            logger.warning(
                "Failure insert failed run_id=%s session_id=%s",
                failure.run_id,
                session_id,
                exc_info=failure_exc,
            )
        logger.error(
            "Lesson generation failed schema validation",
            extra={
                "topic": request.topic,
                "difficulty": request.level,
                "errors": exc.errors(),
            },
            exc_info=exc,
        )
        raise
    except ValueError as exc:
        summary = str(exc) or "Unknown content validation error."
        logger.error(
            "Lesson generation content validation summary: %s",
            summary,
        )
        failure = LessonFailure(
            run_id=str(uuid4()),
            session_id=session_id,
            topic=request.topic,
            level=request.level,
            created_at=datetime.now(timezone.utc),
            error_type="content_validation",
            error_message=summary,
        )
        try:
            insert_lesson_failure(failure.to_mongo())
            logger.info(
                "Failure insert succeeded run_id=%s session_id=%s",
                failure.run_id,
                session_id,
            )
        except Exception as failure_exc:
            logger.warning(
                "Failure insert failed run_id=%s session_id=%s",
                failure.run_id,
                session_id,
                exc_info=failure_exc,
            )
        logger.error(
            "Lesson generation failed content validation",
            extra={
                "topic": request.topic,
                "difficulty": request.level,
                "error": summary,
            },
            exc_info=exc,
        )
        raise
    except Exception as exc:
        logger.error(
            "Lesson generation failure summary: %s",
            type(exc).__name__,
        )
        failure = LessonFailure(
            run_id=str(uuid4()),
            session_id=session_id,
            topic=request.topic,
            level=request.level,
            created_at=datetime.now(timezone.utc),
            error_type=type(exc).__name__,
            error_message=str(exc) or "Unknown error.",
        )
        try:
            insert_lesson_failure(failure.to_mongo())
            logger.info(
                "Failure insert succeeded run_id=%s session_id=%s",
                failure.run_id,
                session_id,
            )
        except Exception as failure_exc:
            logger.warning(
                "Failure insert failed run_id=%s session_id=%s",
                failure.run_id,
                session_id,
                exc_info=failure_exc,
            )
        logger.error(
            "Lesson generation failed",
            extra={
                "topic": request.topic,
                "difficulty": request.level,
            },
            exc_info=exc,
        )
        raise
    # Log the lesson generation request and response to MongoDB
    telemetry = LessonRun(
        run_id=str(uuid4()),
        session_id=session_id,
        topic=request.topic,
        level=request.level,
        created_at=datetime.now(timezone.utc),
        total_minutes=response.total_minutes,
        objective=response.objective,
        section_ids=[s.id for s in response.sections],
    )
    # Attempt to insert telemetry data into MongoDB
    try:
        insert_lesson_run(telemetry.to_mongo())
        logger.info(
            "Telemetry insert succeeded run_id=%s session_id=%s",
            telemetry.run_id,
            session_id,
        )
        logger.info(
            "telemetry_written",
            extra={
                "run_id": telemetry.run_id,
                "topic": telemetry.topic,
                "difficulty": telemetry.level,
                "sections": len(telemetry.section_ids),
            },
        )
    except Exception as exc:
        # Best-effort telemetry: do not break the API if Mongo is unavailable
        logger.warning(
            "Telemetry insert failed run_id=%s session_id=%s",
            telemetry.run_id,
            session_id,
            exc_info=exc,
        )
        pass
    return response
