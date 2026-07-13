"""
Pydantic schemas for auth + user profile endpoints.
"""
from datetime import date, time
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class BirthDetailsUpdate(BaseModel):
    birth_date: date
    birth_time: time
    birth_place: str
    birth_latitude: float
    birth_longitude: float


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    onboarding_complete: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut