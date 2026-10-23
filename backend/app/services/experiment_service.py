import uuid
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.database.mongodb import get_database
from app.services.audit_service import log_audit_event

logger = logging.getLogger("neurolens.experiments")

async def get_all_experiments() -> List[Dict[str, Any]]:
    db = get_database()
    if db is None:
        return []
    cursor = db.experiments.find().sort("created_at", -1)
    experiments = await cursor.to_list(100)
    for exp in experiments:
        exp["_id"] = str(exp["_id"])
    return experiments

async def get_experiment_by_id(exp_id: str) -> Optional[Dict[str, Any]]:
    db = get_database()
    if db is None:
        return None
    exp = await db.experiments.find_one({"_id": exp_id})
    if exp:
        exp["_id"] = str(exp["_id"])
    return exp

async def create_future_experiment(data, creator_id: str) -> Dict[str, Any]:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    exp_id = f"exp_{uuid.uuid4().hex[:12]}"
    doc = {
        "_id": exp_id,
        "name": data.name,
        "description": data.description,
        "parent_model": "global_round_001",
        "current_round": data.target_round,
        "status": "queued",
        "participating_clients": data.participating_clients,
        "client_statuses": {cid: "pending" for cid in data.participating_clients},
        "epochs_per_client": data.epochs_per_client,
        "batch_size": data.batch_size,
        "learning_rate": data.learning_rate,
        "aggregation_method": data.aggregation_method,
        "logs": [f"[{datetime.utcnow().isoformat()}] Experiment created and queued by admin."],
        "error_message": None,
        "creator_id": creator_id,
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None
    }

    await db.experiments.insert_one(doc)
    await log_audit_event(
        action="create_experiment",
        user_id=creator_id,
        role="admin",
        details={"experiment_id": exp_id, "target_round": data.target_round}
    )
    doc["_id"] = exp_id
    return doc

async def cancel_experiment(exp_id: str, admin_id: str) -> Dict[str, Any]:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    exp = await db.experiments.find_one({"_id": exp_id})
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if exp.get("status") in ["completed", "failed", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel experiment in terminal status: {exp.get('status')}"
        )

    now = datetime.utcnow()
    await db.experiments.update_one(
        {"_id": exp_id},
        {
            "$set": {
                "status": "cancelled",
                "completed_at": now
            },
            "$push": {
                "logs": f"[{now.isoformat()}] Experiment cancelled by admin."
            }
        }
    )
    await log_audit_event(
        action="cancel_experiment",
        user_id=admin_id,
        role="admin",
        details={"experiment_id": exp_id}
    )
    return await get_experiment_by_id(exp_id)
