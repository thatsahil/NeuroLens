import io
import uuid
from datetime import datetime
from typing import List, Optional
from PIL import Image
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from app.schemas.prediction import PredictionResponse
from app.services.auth_service import get_current_user
from app.services.storage_service import storage_service
from app.ml.inference import inference_engine
from app.database.mongodb import get_database
from app.api.patients import IN_MEMORY_PATIENTS

router = APIRouter(prefix="/predictions", tags=["Predictions"])

IN_MEMORY_PREDICTIONS = {}

@router.post("/analyze", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def analyze_mri(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # 1. Validate file extension and MIME type
    valid_extensions = (".jpg", ".jpeg", ".png")
    filename = file.filename.lower() if file.filename else "mri_scan.png"
    if not any(filename.endswith(ext) for ext in valid_extensions):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only JPG, JPEG, and PNG images are supported."
        )

    # 2. Read file content & validate size (default max 10MB)
    contents = await file.read()
    max_bytes = 10 * 1024 * 1024  # 10MB
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed size (10 MB).")

    # 3. Validate image readability using Pillow
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
        # Re-open after verify() as verify alters image internal state
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Corrupted or invalid image file. Unable to read MRI scan.")

    # 4. Upload image to Cloudinary (or fallback)
    image_url = await storage_service.upload_image(contents, file.filename or "mri_scan.png")

    # 5. Run DenseNet121 Inference
    try:
        inf_result = inference_engine.predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    # 6. Fetch patient name for summary
    patient_name = "Patient " + patient_id
    db = get_database()
    if db is not None:
        try:
            pat_doc = await db.patients.find_one({"_id": patient_id})
            if pat_doc:
                patient_name = pat_doc.get("name", patient_name)
        except Exception:
            pass

    if patient_name == "Patient " + patient_id and patient_id in IN_MEMORY_PATIENTS:
        patient_name = IN_MEMORY_PATIENTS[patient_id]["name"]

    pred_id = f"pred_{str(uuid.uuid4())[:8]}"
    prediction_doc = {
        "_id": pred_id,
        "patient_id": patient_id,
        "patient_name": patient_name,
        "image_url": image_url,
        "predicted_class": inf_result["predicted_class"],
        "confidence": inf_result["confidence"],
        "probabilities": inf_result["probabilities"],
        "model": inf_result["model"],
        "model_version": inf_result["model_version"],
        "inference_time_ms": inf_result["inference_time_ms"],
        "created_at": datetime.utcnow(),
        "created_by": current_user.get("name", "Doctor")
    }

    if db is not None:
        try:
            await db.predictions.insert_one(prediction_doc)
        except Exception:
            IN_MEMORY_PREDICTIONS[pred_id] = prediction_doc
    else:
        IN_MEMORY_PREDICTIONS[pred_id] = prediction_doc

    return prediction_doc

@router.get("", response_model=List[PredictionResponse])
async def list_predictions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    preds = []
    if db is not None:
        try:
            cursor = db.predictions.find().sort("created_at", -1)
            async for doc in cursor:
                preds.append(doc)
            if preds:
                return preds
        except Exception:
            pass

    res = list(IN_MEMORY_PREDICTIONS.values())
    return sorted(res, key=lambda x: str(x.get("created_at")), reverse=True)

@router.get("/{id}", response_model=PredictionResponse)
async def get_prediction(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if db is not None:
        try:
            doc = await db.predictions.find_one({"_id": id})
            if doc:
                return doc
        except Exception:
            pass

    if id in IN_MEMORY_PREDICTIONS:
        return IN_MEMORY_PREDICTIONS[id]

    raise HTTPException(status_code=404, detail="Prediction record not found")

@router.get("/patient/{patient_id}", response_model=List[PredictionResponse])
async def get_patient_predictions(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    preds = []
    if db is not None:
        try:
            cursor = db.predictions.find({"patient_id": patient_id}).sort("created_at", -1)
            async for doc in cursor:
                preds.append(doc)
            if preds:
                return preds
        except Exception:
            pass

    res = [p for p in IN_MEMORY_PREDICTIONS.values() if p.get("patient_id") == patient_id]
    return sorted(res, key=lambda x: str(x.get("created_at")), reverse=True)

