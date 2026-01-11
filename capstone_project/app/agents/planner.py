from typing import List

from app.models.agents import PlannedSection
    
class PlannerAgent:
    def plan(self, topic: str, level: str) -> List[PlannedSection]:
        """
        Decides the structure of a lesson.
        For now, this is deterministic and hardcoded.
        """
        return [
            PlannedSection(
                id="concept",
                title="Core concept",
                minutes=15,
            )
        ]
        
