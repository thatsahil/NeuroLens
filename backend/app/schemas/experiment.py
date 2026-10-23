from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExperimentCreate(BaseModel):
    name: str = Field(..., example="Round 2 Experiment")
    description: Optional[str] = None
    target_round: int = Field(2, ge=2)
    participating_clients: List[str] = Field(default=["hospital_1", "hospital_2", "hospital_3"])
    epochs_per_client: int = Field(default=3, ge=1, le=20)
    batch_size: int = Field(default=32, ge=8, le=128)
    learning_rate: float = Field(default=1e-4, gt=0)
    aggregation_method: str = Field(default="FedAvg")

class ExperimentResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str] = None
    parent_model: str = "global_round_001"
    current_round: int
    status: str # queued, running, completed, failed, cancelled
    participating_clients: List[str]
    client_statuses: Optional[Dict[str, str]] = None
    epochs_per_client: Optional[int] = 3
    batch_size: Optional[int] = 32
    learning_rate: Optional[float] = 1e-4
    aggregation_method: str = "FedAvg"
    logs: Optional[List[str]] = []
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
