from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field

class ClassProbabilities(BaseModel):
    NonDemented: float = Field(..., example=0.012)
    VeryMildDemented: float = Field(..., example=0.021)
    MildDemented: float = Field(..., example=0.941)
    ModerateDemented: float = Field(..., example=0.026)

class PredictionResponse(BaseModel):
    id: str = Field(..., alias="_id")
    patient_id: str
    patient_name: Optional[str] = None
    image_url: str
    predicted_class: str = Field(..., example="MildDemented")
    confidence: float = Field(..., example=0.941)
    probabilities: ClassProbabilities
    model: str = Field("DenseNet121", example="DenseNet121")
    model_version: str = Field("1.0", example="1.0")
    inference_time_ms: float = Field(..., example=120.5)
    created_at: datetime
    created_by: str

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class DashboardStats(BaseModel):
    total_patients: int
    total_scans: int
    class_counts: Dict[str, int]
