# NeuroLens Backend API

Production-ready FastAPI backend for AI-assisted Alzheimer's MRI Detection and Explainable AI (HiResCAM) using DenseNet121.

## Active Model & Centralized Checkpoint Integration
- **Architecture**: DenseNet121 (`torchvision.models.densenet121`) with `nn.Linear(1024, 4)` head
- **Training Mode**: Centralized training on Kaggle MRI dataset (10 epochs, AdamW lr=0.0001, Weighted Cross Entropy)
- **Active Checkpoint Path**: `app/ml/weights/densenet121_best.pth`
- **SHA-256 Checksum**: `f00e9d22212e68fadae8c50dc6d84cbe25727485cd9a55319d87889044eb43a8`
- **Class Mapping**:
  - `0`: Mild Dementia
  - `1`: Moderate Dementia
  - `2`: Non Demented
  - `3`: Very mild Dementia
- **Preprocessing**: Aspect-ratio-preserving resize (`thumbnail(224, 224, LANCZOS)`) centered onto a `224x224` black canvas followed by ImageNet normalization (`mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]`).
- **Single Source of Truth**: `model_registry` deterministically loads the verified checkpoint strictly. Both normal prediction (`inference_engine`) and Explainable AI (`hirescam_engine`) share the exact same model weights and identical preprocessing. No random weights are ever substituted.

## Tech Stack
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Machine Learning**: PyTorch, Torchvision (DenseNet121)
- **Database**: MongoDB Atlas (Motor Async driver)
- **Cloud Storage**: Cloudinary
- **Auth**: JWT (PyJWT), Passlib/Bcrypt

## API Endpoints
- `GET /api/v1/health` - System health and model status
- `POST /api/v1/auth/register` - Register user (Doctor/Patient/Admin)
- `POST /api/v1/auth/login` - Authenticate user
- `GET /api/v1/auth/me` - Current user details
- `GET /api/v1/patients` - List/search patients
- `POST /api/v1/patients` - Add new patient
- `GET /api/v1/patients/{id}` - Patient details
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient
- `POST /api/v1/predictions/analyze` - Upload MRI scan & run DenseNet121 inference
- `GET /api/v1/predictions` - List scan prediction history
- `GET /api/v1/predictions/{id}` - Prediction details
- `GET /api/v1/predictions/patient/{patient_id}` - Patient scan history
- `GET /api/v1/reports/stats` - Dashboard analytics & class distribution

## Setup & Running Locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
