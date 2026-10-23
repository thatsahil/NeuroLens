import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.services.model_service import model_registry
from app.api import auth, federated, assistant

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("neurolens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NeuroLens Federated Research Dashboard Backend...")
    # 1. Connect to MongoDB
    await connect_to_mongo()
    # 2. Check and register active model status (Do NOT auto-train)
    model_registry.initialize()
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
        "service": "NeuroLens Federated Learning Research Platform",
        "version": "2.0.0",
        "active_model_status": model_registry.status,
        "active_model_version": "global_round_001",
        "device": str(model_registry.device)
    }

# Register Core Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(federated.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
