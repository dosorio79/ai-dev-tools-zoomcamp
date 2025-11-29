from pydantic import BaseModel, Field
from datetime import datetime

class LiveGame(BaseModel):
    id: str
    username: str
    currentScore: int
    mode: str = Field(pattern="^(pass-through|walls)$")
    startedAt: datetime
