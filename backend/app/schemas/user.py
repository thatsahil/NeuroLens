from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str = Field(..., example="Dr. Sarah Connor")
    email: EmailStr = Field(..., example="sarah@neurolens.med")
    role: str = Field("doctor", example="doctor") # doctor, patient, admin

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="Password123!")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="sarah@neurolens.med")
    password: str = Field(..., example="Password123!")

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
