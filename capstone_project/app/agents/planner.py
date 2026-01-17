"""Planner agent responsible for lesson structure."""

from typing import List

from app.models.agents import PlannedSection
    
class PlannerAgent:
    """Generates a deterministic lesson plan."""
    def plan(self, topic: str, level: str) -> List[PlannedSection]:
        """Return a section outline based on topic and level."""
        return [
            PlannedSection(
                id="concept",
                title="Core concept",
                minutes=5,
            ),
            PlannedSection(
                id="example",
                title="Worked example",
                minutes=6,
            ),
            PlannedSection(
                id="exercise",
                title="Practice exercise",
                minutes=4,
            ),
        ]
        
