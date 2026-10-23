import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from app.database.mongodb import get_database

logger = logging.getLogger("neurolens.audit")

async def log_audit_event(
    action: str,
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    client_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status: str = "success"
):
    """
    Persists an append-only audit event in MongoDB.
    """
    event = {
        "_id": str(uuid.uuid4()),
        "action": action,
        "user_id": user_id,
        "role": role,
        "client_id": client_id,
        "details": details or {},
        "status": status,
        "timestamp": datetime.utcnow()
    }
    db = get_database()
    if db is not None:
        try:
            await db.audit_events.insert_one(event)
        except Exception as e:
            logger.error(f"Failed to log audit event to MongoDB: {e}")
    else:
        logger.info(f"Audit (No DB): {event}")
    return event
