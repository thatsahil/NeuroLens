from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str = Field(..., example="System Administrator")
    email: EmailStr = Field(..., example="admin@neurolens.org")
    role: str = Field(..., example="admin") # "admin" or "hospital"
    client_id: Optional[str] = Field(None, example="hospital_1") # Set strictly for hospital role

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="SecurePassword123!")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="admin@neurolens.org")
    password: str = Field(..., example="SecurePassword123!")

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
    user_id: Optional[str] = None
    role: Optional[str] = None
    client_id: Optional[str] = None
