from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from pydantic import BaseModel
class UpdatePriorityRequest(BaseModel):
    priority: str
class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10)
    category: str
    block: str
    flat_number: str


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class ComplaintStatusUpdate(BaseModel):
    status: str


class ComplaintResponse(BaseModel):
    complaint_id: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    resident_id: str
    resident_name: str
    block: str
    flat_number: str
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None