import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.auth_service import get_current_user
from app.database.mongodb import get_database

router = APIRouter(prefix="/patients", tags=["Patients"])

IN_MEMORY_PATIENTS = {
    "pat_001": {
        "_id": "pat_001",
        "name": "Eleanor Vance",
        "age": 72,
        "gender": "Female",
        "contact": "+1 (555) 234-5678",
        "created_at": datetime.utcnow(),
        "created_by": "Dr. Sarah Connor"
    },
    "pat_002": {
        "_id": "pat_002",
        "name": "Robert Miller",
        "age": 65,
        "gender": "Male",
        "contact": "+1 (555) 876-5432",
        "created_at": datetime.utcnow(),
        "created_by": "Dr. Sarah Connor"
    },
    "pat_003": {
        "_id": "pat_003",
        "name": "Margaret Thorne",
        "age": 79,
        "gender": "Female",
        "contact": "+1 (555) 345-6789",
        "created_at": datetime.utcnow(),
        "created_by": "Dr. Sarah Connor"
    }
}

@router.get("", response_model=List[PatientResponse])
async def list_patients(
    search: Optional[str] = Query(None, description="Search by patient name"),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    patients_list = []
    
    if db is not None:
        try:
            query = {}
            if search:
                query["name"] = {"$regex": search, "$options": "i"}
            cursor = db.patients.find(query).sort("created_at", -1)
            async for p in cursor:
                patients_list.append(p)
            if patients_list:
                return patients_list
        except Exception:
            pass

    # Fallback to in-memory store
    res = list(IN_MEMORY_PATIENTS.values())
    if search:
        search_lower = search.lower()
        res = [p for p in res if search_lower in p["name"].lower()]
    return sorted(res, key=lambda x: str(x.get("created_at")), reverse=True)

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_in: PatientCreate,
    current_user: dict = Depends(get_current_user)
):
    pat_id = f"pat_{str(uuid.uuid4())[:8]}"
    doc = {
        "_id": pat_id,
        "name": patient_in.name,
        "age": patient_in.age,
        "gender": patient_in.gender,
        "contact": patient_in.contact or "",
        "created_at": datetime.utcnow(),
        "created_by": current_user.get("name", "Doctor")
    }

    db = get_database()
    if db is not None:
        try:
            await db.patients.insert_one(doc)
        except Exception:
            IN_MEMORY_PATIENTS[pat_id] = doc
    else:
        IN_MEMORY_PATIENTS[pat_id] = doc

    return doc

@router.get("/{id}", response_model=PatientResponse)
async def get_patient(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if db is not None:
        try:
            doc = await db.patients.find_one({"_id": id})
            if doc:
                return doc
        except Exception:
            pass

    if id in IN_MEMORY_PATIENTS:
        return IN_MEMORY_PATIENTS[id]

    raise HTTPException(status_code=404, detail="Patient not found")

@router.put("/{id}", response_model=PatientResponse)
async def update_patient(
    id: str,
    patient_in: PatientUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    update_data = {k: v for k, v in patient_in.dict(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        existing = await get_patient(id, current_user)
        return existing

    if db is not None:
        try:
            res = await db.patients.find_one_and_update(
                {"_id": id},
                {"$set": update_data},
                return_document=True
            )
            if res:
                return res
        except Exception:
            pass

    if id in IN_MEMORY_PATIENTS:
        IN_MEMORY_PATIENTS[id].update(update_data)
        return IN_MEMORY_PATIENTS[id]

    raise HTTPException(status_code=404, detail="Patient not found")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    deleted = False

    if db is not None:
        try:
            res = await db.patients.delete_one({"_id": id})
            if res.deleted_count > 0:
                deleted = True
        except Exception:
            pass

    if id in IN_MEMORY_PATIENTS:
        del IN_MEMORY_PATIENTS[id]
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return None
