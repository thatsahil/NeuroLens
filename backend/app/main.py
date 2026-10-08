import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.ml.inference import inference_engine
from app.api import auth, patients, predictions, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("neurolens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NeuroLens Backend...")
    # 1. Connect to MongoDB
    await connect_to_mongo()
    # 2. Pre-load DenseNet121 model into RAM/VRAM once at startup
    inference_engine.load_model()
    yield
    # Cleanup
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.BACKEND_CORS_ORIGINS == ["*"] else settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get(f"{settings.API_V1_STR}/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "NeuroLens Alzheimer's MRI Detection API",
        "version": "1.0.0",
        "model_loaded": inference_engine.is_loaded,
        "device": str(inference_engine.device)
    }

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
