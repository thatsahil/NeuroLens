from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import register_user, authenticate_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    return await register_user(user_in)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    return await authenticate_user(credentials.email, credentials.password)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
