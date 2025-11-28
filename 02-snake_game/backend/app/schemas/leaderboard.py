from pydantic import BaseModel, Field
from datetime import datetime

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: str = Field(pattern="^(pass-through|walls)$")
    date: datetime

class SubmitScoreRequest(BaseModel):
    score: int
    mode: str = Field(pattern="^(pass-through|walls)$")
