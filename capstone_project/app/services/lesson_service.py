"""Lesson service orchestration and telemetry logging."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from app.models.api import LessonRequest, LessonResponse, LessonSection
from app.models.db import LessonRun
from app.services.mongo import insert_lesson_run
from app.agents.planner import PlannerAgent
from app.agents.content import ContentAgent
from app.agents.validator import ValidatorAgent

logger = logging.getLogger(__name__)

# instantiate agents
planner_agent = PlannerAgent()
content_agent = ContentAgent()
validator_agent = ValidatorAgent()


def generate_lesson(request: LessonRequest) -> LessonResponse:
    """Generate a lesson using the agent pipeline and record telemetry."""
    session_id = str(request.session_id) if request.session_id else str(uuid4())
    
    # create agentic pipeline
    # 1. planning
    planned_sections = planner_agent.plan(request.topic, 
                                          request.level, 
                                          )
    # 2. content generation
    generated_sections = content_agent.generate(topic=request.topic,
                                                planned_sections=planned_sections)
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
                content_markdown=s.content_markdown,
            ) for s in validated_sections
        ],
    )
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
