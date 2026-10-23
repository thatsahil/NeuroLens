from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Dict, Any
from PIL import Image
import io

from app.services.auth_service import require_admin, require_hospital, get_current_user
from app.database.mongodb import get_database
from app.services.model_service import model_registry
from app.services.experiment_service import (
    get_all_experiments, get_experiment_by_id, create_future_experiment, cancel_experiment
)
from app.services.hirescam_service import hirescam_engine
from app.services.audit_service import log_audit_event
from app.schemas.experiment import ExperimentCreate, ExperimentResponse

router = APIRouter(tags=["Federated Research"])

# ==================== MRI UPLOAD & EXPLAINABLE AI (HiResCAM) ====================

@router.post("/mri/analyze")
async def analyze_mri_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Available to ALL authenticated roles (admin and all hospital workspaces).
    Accepts an MRI scan image, generates 4-class prediction probabilities using DenseNet121,
    and runs HiResCAM explainable AI to highlight the exact salient brain region.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, etc.)."
        )

    try:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse MRI image: {str(e)}"
        )

    try:
        result = hirescam_engine.classify_and_explain(pil_img)
        
        # Log to audit trail
        await log_audit_event(
            action="mri_hirescam_analysis",
            user_id=current_user.get("_id"),
            role=current_user.get("role"),
            client_id=current_user.get("client_id"),
            details={
                "predicted_class": result["predicted_class"],
                "confidence": result["confidence"],
                "filename": file.filename
            }
        )

        return {
            "status": "success",
            "filename": file.filename,
            "uploader": {
                "role": current_user.get("role"),
                "client_id": current_user.get("client_id"),
                "name": current_user.get("name")
            },
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference and HiResCAM generation failed: {str(e)}"
        )

# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/overview")
async def get_admin_overview(admin: dict = Depends(require_admin)):
    """
    Returns administrative KPI metrics, verified model lineage, hospital summary, and recent audit logs.
    """
    db = get_database()
    active_model = await model_registry.get_active_model_info()

    hospitals = []
    if db is not None:
        hospitals = await db.hospital_clients.find().to_list(10)
        recent_audits = await db.audit_events.find().sort("timestamp", -1).to_list(10)
    else:
        recent_audits = []

    for h in hospitals:
        h["id"] = str(h.pop("_id", ""))
    for a in recent_audits:
        a["id"] = str(a.pop("_id", ""))

    return {
        "kpis": {
            "current_round": 1,
            "active_model_version": "global_round_001",
            "model_architecture": "DenseNet121",
            "connected_clients_count": 3,
            "total_federated_samples": 69465,
            "evaluation_status": "Not evaluated",
            "aggregation_strategy": "FedAvg (Sample-Weighted)"
        },
        "active_model": active_model,
        "hospitals": hospitals,
        "recent_audits": recent_audits
    }

@router.get("/admin/hospitals")
async def get_admin_hospitals(admin: dict = Depends(require_admin)):
    db = get_database()
    if db is None:
        return []
    hospitals = await db.hospital_clients.find().to_list(10)
    for h in hospitals:
        h["id"] = str(h.pop("_id", ""))
    return hospitals

@router.get("/admin/audit")
async def get_admin_audit(admin: dict = Depends(require_admin)):
    db = get_database()
    if db is None:
        return []
    audits = await db.audit_events.find().sort("timestamp", -1).to_list(50)
    for a in audits:
        a["id"] = str(a.pop("_id", ""))
    return audits

@router.get("/experiments", response_model=List[ExperimentResponse])
async def list_experiments(current_user: dict = Depends(get_current_user)):
    return await get_all_experiments()

@router.post("/experiments", response_model=ExperimentResponse)
async def create_experiment(data: ExperimentCreate, admin: dict = Depends(require_admin)):
    return await create_future_experiment(data, creator_id=admin["_id"])

@router.get("/experiments/{exp_id}", response_model=ExperimentResponse)
async def get_experiment(exp_id: str, current_user: dict = Depends(get_current_user)):
    exp = await get_experiment_by_id(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/experiments/{exp_id}/cancel", response_model=ExperimentResponse)
async def cancel_experiment_endpoint(exp_id: str, admin: dict = Depends(require_admin)):
    return await cancel_experiment(exp_id, admin_id=admin["_id"])

@router.get("/models")
async def list_models(current_user: dict = Depends(get_current_user)):
    return await model_registry.list_models()

@router.get("/models/active")
async def get_active_model(current_user: dict = Depends(get_current_user)):
    return await model_registry.get_active_model_info()

# ==================== HOSPITAL ENDPOINTS (STRICTLY SCOPED) ====================

@router.get("/hospitals/me")
async def get_hospital_workspace(hospital_user: dict = Depends(require_hospital)):
    """
    Returns only the authenticated hospital client's workspace data.
    Other hospitals' information is strictly inaccessible.
    """
    client_id = hospital_user["client_id"]
    db = get_database()
    
    client_doc = None
    if db is not None:
        client_doc = await db.hospital_clients.find_one({"_id": client_id})

    active_model = await model_registry.get_active_model_info()

    return {
        "client_id": client_id,
        "display_name": client_doc.get("display_name", client_id) if client_doc else client_id,
        "sample_count": client_doc.get("sample_count", 0) if client_doc else 0,
        "fedavg_weight": client_doc.get("fedavg_weight", 0.0) if client_doc else 0.0,
        "round_1_checkpoint_hash": client_doc.get("round_1_checkpoint_hash") if client_doc else None,
        "status": client_doc.get("status", "ready") if client_doc else "ready",
        "active_global_model": {
            "version_tag": active_model.get("version_tag"),
            "round": active_model.get("round"),
            "model_name": active_model.get("model_name"),
            "sha256": active_model.get("sha256")
        },
        "evaluation_caveat": "Simulated single-machine client partition for federated research."
    }

@router.get("/hospitals/me/metrics")
async def get_hospital_metrics(hospital_user: dict = Depends(require_hospital)):
    client_id = hospital_user["client_id"]
    db = get_database()
    
    client_doc = None
    if db is not None:
        client_doc = await db.hospital_clients.find_one({"_id": client_id})

    return {
        "client_id": client_id,
        "round": 1,
        "training_samples": client_doc.get("sample_count") if client_doc else 0,
        "classes": {
            "Mild Dementia": "Present in shard",
            "Moderate Dementia": "Present in shard",
            "Non Demented": "Present in shard",
            "Very mild Dementia": "Present in shard"
        },
        "local_evaluation_status": "Not evaluated",
        "note": "Per-client local loss/accuracy curve is marked 'Not evaluated' until a formal verification run is computed."
    }
