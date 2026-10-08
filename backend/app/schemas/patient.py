from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PatientBase(BaseModel):
    name: str = Field(..., example="John Doe")
    age: int = Field(..., ge=0, le=120, example=68)
    gender: str = Field(..., example="Male")
    contact: Optional[str] = Field(None, example="+1-555-0199")

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None

class PatientResponse(PatientBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    created_by: str

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
