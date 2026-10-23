from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class AuditEventCreate(BaseModel):
    action: str
    user_id: Optional[str] = None
    role: Optional[str] = None
    client_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    status: str = "success" # success, failure, denied

class AuditEventResponse(AuditEventCreate):
    id: str = Field(..., alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
