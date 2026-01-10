# LessonPlannerAgent
from dataclasses import dataclass
from typing import List

@dataclass
class PlannedSection:
    id: str
    title: str
    minutes: int
    
class PlannerAgent:
    def plan_lesson(self, topic: str, level: str) -> List[PlannedSection]:
        """
        Decides the structure of a lesson.
        For now, this is deterministic and hardcoded.
        """
        return [
            PlannedSection(
                id="concept",
                title="Core concept",
                minutes=6,
            )
        ]
        