from fastapi import APIRouter, Depends
from app.schemas.user import UserLogin, UserResponse, Token
from app.services.auth_service import authenticate_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Authenticate one of the four seeded accounts (admin or hospital_1/2/3).
    Self-registration is disabled per system architecture requirements.
    """
    return await authenticate_user(credentials.email, credentials.password)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieve currently authenticated user profile with backend-authoritative role and client_id.
    """
    return current_user
