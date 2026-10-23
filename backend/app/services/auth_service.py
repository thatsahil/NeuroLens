import uuid
from datetime import datetime
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.database.mongodb import get_database
from app.services.audit_service import log_audit_event

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def authenticate_user(email: str, password: str):
    email = email.lower().strip()
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable. Please ensure MongoDB is running."
        )

    user_doc = await db.users.find_one({"email": email})

    if not user_doc or not verify_password(password, user_doc.get("password_hash", "")):
        await log_audit_event(
            action="login_failed",
            details={"email": email},
            status="failure"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user_doc.get("disabled", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    access_token = create_access_token(
        subject=user_doc["_id"],
        role=user_doc["role"],
        client_id=user_doc.get("client_id")
    )

    await log_audit_event(
        action="user_login",
        user_id=user_doc["_id"],
        role=user_doc["role"],
        client_id=user_doc.get("client_id"),
        status="success"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "_id": user_doc["_id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "client_id": user_doc.get("client_id"),
            "created_at": user_doc.get("created_at", datetime.utcnow())
        }
    }

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable."
        )

    user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc or user_doc.get("disabled", False):
        raise credentials_exception

    return {
        "_id": user_doc["_id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "client_id": user_doc.get("client_id"),
        "created_at": user_doc.get("created_at", datetime.utcnow())
    }

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        await log_audit_event(
            action="unauthorized_admin_access_attempt",
            user_id=current_user.get("_id"),
            role=current_user.get("role"),
            status="denied"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required for this action."
        )
    return current_user

async def require_hospital(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "hospital" or not current_user.get("client_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital client workspace access required."
        )
    return current_user
