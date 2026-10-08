# NeuroLens — Alzheimer's MRI AI Detection System

NeuroLens is a production-ready AI-assisted web application for Alzheimer's Disease MRI classification powered by PyTorch DenseNet121, FastAPI, and React Vite.

## Key Features
- **DenseNet121 AI Engine**: 99.04% test benchmark accuracy across 4 dementia stages (`NonDemented`, `VeryMildDemented`, `MildDemented`, `ModerateDemented`).
- **Clinical Authentication**: JWT bearer auth with doctor, patient, and admin roles.
- **Patient Management**: Complete cohort directory, search, CRUD operations, and longitudinal scan tracking.
- **MRI Upload & Validation**: Format validation (JPG/PNG), size limits (10 MB), Pillow integrity checks, Cloudinary cloud storage.
- **Interactive Results**: MRI viewer (zoom, invert contrast, reset), Recharts class probability visualization, inference latency timing.
- **Direct Frontend Gemini AI Integration**: Direct Gemini API decision support assistant for natural language clinical summaries and patient communication.
- **Medical Safety Compliance**: Explicit decision support disclaimers across all inference outputs.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Lucide React, Google Generative AI SDK
- **Backend**: Python 3.14+, FastAPI, Uvicorn, Pydantic, PyTorch, Torchvision, Pillow, Motor, PyJWT, Passlib, Cloudinary
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary CDN
- **Deployment Targets**: Vercel (Frontend), Render (Backend)

## Quick Start (Local Development)

### 1. Backend Startup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will run at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.

## Architecture & Documentation
- [Architecture Overview](file:///d:/MEGA%20PROJECT/NeuroLens/docs/architecture.md)
- [API Reference](file:///d:/MEGA%20PROJECT/NeuroLens/docs/api.md)
- [DenseNet121 Model Specifications](file:///d:/MEGA%20PROJECT/NeuroLens/docs/model.md)
- [Backend Documentation](file:///d:/MEGA%20PROJECT/NeuroLens/backend/README.md)
- [ML Pipeline Documentation](file:///d:/MEGA%20PROJECT/NeuroLens/ml/README.md)

## Deployment Guidelines
- **Frontend**: Vercel (`npm run build`)
- **Backend**: Render Web Service (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- **Database**: MongoDB Atlas Cluster
- **Image Storage**: Cloudinary Account
