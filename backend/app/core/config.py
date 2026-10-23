import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroLens Federated Research Dashboard"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    SECRET_KEY: str = Field(default="neurolens_dev_secret_key_change_in_production_min_32_chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URL: str = Field(default="mongodb://localhost:27017")
    DATABASE_NAME: str = Field(default="neurolens_federated_db")
    
    # Federated Artifact Root
    NEUROLENS_ARTIFACT_ROOT: str = Field(default="artifacts")
    ACTIVE_MODEL_PATH: str = Field(default="artifacts/global_models/global_model_round_001.pth")
    
    # Optional Gemini AI Assistant (Backend-only credentials)
    GEMINI_API_KEY: str = Field(default="")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://neurolens.vercel.app"
    ]

    model_config = {
        "case_sensitive": True,
        "env_file": (".env", "backend/.env"),
        "extra": "ignore"
    }

settings = Settings()
