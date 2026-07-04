from pydantic import BaseModel
from typing import Optional


class NoticeCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None