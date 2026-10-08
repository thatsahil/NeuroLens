from fastapi import APIRouter, Depends
from app.schemas.prediction import DashboardStats
from app.services.auth_service import get_current_user
from app.database.mongodb import get_database
from app.api.patients import IN_MEMORY_PATIENTS
from app.api.predictions import IN_MEMORY_PREDICTIONS

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    total_patients = 0
    total_scans = 0
    class_counts = {
        "NonDemented": 0,
        "VeryMildDemented": 0,
        "MildDemented": 0,
        "ModerateDemented": 0
    }

    if db is not None:
        try:
            total_patients = await db.patients.count_documents({})
            total_scans = await db.predictions.count_documents({})
            
            pipeline = [
                {"$group": {"_id": "$predicted_class", "count": {"$sum": 1}}}
            ]
            agg = await db.predictions.aggregate(pipeline).to_list(length=10)
            for item in agg:
                cls_name = item["_id"]
                if cls_name in class_counts:
                    class_counts[cls_name] = item["count"]
                    
            if total_patients > 0 or total_scans > 0:
                return {
                    "total_patients": total_patients,
                    "total_scans": total_scans,
                    "class_counts": class_counts
                }
        except Exception:
            pass

    # Fallback using in-memory mock datasets
    total_patients = len(IN_MEMORY_PATIENTS)
    total_scans = len(IN_MEMORY_PREDICTIONS)
    for p in IN_MEMORY_PREDICTIONS.values():
        cls_name = p.get("predicted_class")
        if cls_name in class_counts:
            class_counts[cls_name] += 1

    return {
        "total_patients": total_patients,
        "total_scans": total_scans,
        "class_counts": class_counts
    }
