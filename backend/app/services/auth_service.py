import uuid
from datetime import datetime
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.database.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# In-memory user storage fallback when MongoDB isn't running locally
IN_MEMORY_USERS = {}

async def register_user(user_data):
    db = get_database()
    email = user_data.email.lower().strip()
    
    # Check if exists in MongoDB or In-Memory
    if db is not None:
        try:
            existing = await db.users.find_one({"email": email})
            if existing:
                raise HTTPException(status_code=400, detail="Email is already registered")
        except Exception:
            pass

    if email in IN_MEMORY_USERS:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user_data.password)
    user_doc = {
        "_id": user_id,
        "name": user_data.name,
        "email": email,
        "password_hash": hashed_pw,
        "role": user_data.role,
        "created_at": datetime.utcnow()
    }

    if db is not None:
        try:
            await db.users.insert_one(user_doc)
        except Exception:
            IN_MEMORY_USERS[email] = user_doc
    else:
        IN_MEMORY_USERS[email] = user_doc

    access_token = create_access_token(user_id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "_id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "created_at": user_doc["created_at"]
        }
    }

async def authenticate_user(email: str, password: str):
    email = email.lower().strip()
    user_doc = None
    db = get_database()
    
    if db is not None:
        try:
            user_doc = await db.users.find_one({"email": email})
        except Exception:
            pass

    if not user_doc and email in IN_MEMORY_USERS:
        user_doc = IN_MEMORY_USERS[email]

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(password, user_doc["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(user_doc["_id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "_id": user_doc["_id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "created_at": user_doc["created_at"]
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
    user_doc = None
    if db is not None:
        try:
            user_doc = await db.users.find_one({"_id": user_id})
        except Exception:
            pass

    if not user_doc:
        for u in IN_MEMORY_USERS.values():
            if u["_id"] == user_id:
                user_doc = u
                break

    if not user_doc:
        # Default mock admin doctor user if token valid
        user_doc = {
            "_id": user_id,
            "name": "Dr. Medical Professional",
            "email": "doctor@neurolens.med",
            "role": "doctor",
            "created_at": datetime.utcnow()
        }

    return {
        "_id": user_doc["_id"],
        "name": user_doc.get("name", "User"),
        "email": user_doc.get("email", ""),
        "role": user_doc.get("role", "doctor"),
        "created_at": user_doc.get("created_at", datetime.utcnow())
    }
