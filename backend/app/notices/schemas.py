from pydantic import BaseModel
from typing import Optional


class NoticeCreate(BaseModel):
    title: str
    content: str


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None