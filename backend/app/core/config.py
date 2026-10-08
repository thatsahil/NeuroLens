import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroLens - Alzheimer's MRI Detection"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "neurolens_super_secret_jwt_key_2026_change_in_prod_9904")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "neurolens_db")
    
    # Cloudinary Image Storage
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # ML Model Config
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/ml/weights/densenet121.pth")
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://neurolens.vercel.app"
    ]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
