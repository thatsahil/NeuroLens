# NeuroLens Backend API

Production-ready FastAPI backend for AI-assisted Alzheimer's MRI Detection using DenseNet121.

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
