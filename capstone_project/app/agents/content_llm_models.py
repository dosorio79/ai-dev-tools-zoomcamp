from typing import List, Literal
from pydantic import BaseModel


class LLMBlockModel(BaseModel):
    type: Literal["text", "python", "exercise"]
    content: str


class LLMSectionModel(BaseModel):
    id: str
    title: str
    minutes: int
    blocks: List[LLMBlockModel]


class LLMLessonModel(BaseModel):
    sections: List[LLMSectionModel]
