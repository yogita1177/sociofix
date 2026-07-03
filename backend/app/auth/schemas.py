from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=3)

    email: EmailStr

    password: str = Field(..., min_length=6)

    phone: Optional[str] = None

    block: Optional[str] = None

    flat_number: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr

    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str

    name: str

    email: EmailStr

    role: str

    phone: Optional[str]

    block: Optional[str]

    flat_number: Optional[str]