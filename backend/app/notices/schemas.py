from typing import Optional
from pydantic import BaseModel

class NoticeCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None