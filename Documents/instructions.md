# Alzheimer's MRI Detection — Antigravity Development Instructions

## Goal
Build a production-ready AI-assisted Alzheimer's MRI classification web application. Users must be able to authenticate, manage patients, upload MRI images, run DenseNet121 inference, view prediction/confidence/class probabilities, and review prediction history. Keep the architecture ready for a future Federated Learning phase.

## Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React
- Backend: Python, FastAPI, Uvicorn, Pydantic, PyTorch, Torchvision, Pillow, python-multipart, JWT, password hashing
- Database: MongoDB Atlas
- Image storage: Cloudinary
- Deployment: Vercel frontend, Render backend
- Future FL: PyTorch + Flower + FedAvg

Do not add unnecessary technologies.

## Selected ML model
DenseNet121 is the production model.

Benchmark:
- EfficientNet-B0: 90.28% test accuracy, 90.25% weighted F1
- ResNet50: 98.10% test accuracy, 98.10% weighted F1
- DenseNet121: 99.04% test accuracy, 99.04% weighted F1

Classes:
0 = NonDemented
1 = VeryMildDemented
2 = MildDemented
3 = ModerateDemented

Inference preprocessing:
- RGB
- Resize 224x224
- ToTensor
- ImageNet normalization:
  mean [0.485, 0.456, 0.406]
  std  [0.229, 0.224, 0.225]

Load the trained DenseNet121 checkpoint once at backend startup. Do not load the model for every request. Use eval mode and no_grad during inference. CPU inference must work if CUDA is unavailable.

## Research limitation
The benchmark used an image-level stratified split because reliable patient IDs were unavailable. Do not claim the 99.04% result is patient-level or clinically validated. If patient IDs become available, add a patient-level split and re-evaluate.

## Repository structure
```text
alzheimer-mri-detection/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── patients.py
│   │   │   ├── predictions.py
│   │   │   └── reports.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── database/
│   │   │   └── mongodb.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   └── prediction.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── inference_service.py
│   │   │   └── storage_service.py
│   │   ├── ml/
│   │   │   ├── model.py
│   │   │   ├── preprocessing.py
│   │   │   ├── inference.py
│   │   │   └── weights/
│   │   │       └── densenet121.pth
│   │   └── utils/
│   ├── requirements.txt
│   └── README.md
├── ml/
│   ├── notebooks/
│   ├── training/
│   ├── evaluation/
│   └── README.md
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── model.md
├── .gitignore
└── README.md
```

Do not create a monolithic `main.py`.

## Sprint 1 — Foundation
- Create React/Vite frontend.
- Tailwind, Router, Axios.
- Create FastAPI backend.
- MongoDB Atlas connection.
- Environment configuration.
- CORS.
- `GET /api/v1/health`.
- Verify frontend → backend → MongoDB connectivity.
- No hardcoded secrets.

## Sprint 2 — Authentication
Implement registration, login, logout/token handling, JWT, password hashing, protected routes, and roles: doctor, patient, admin.

Endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Sprint 3 — Patient Management
Implement patient list, add, details, edit, delete, search.

Endpoints:
- `GET /api/v1/patients`
- `POST /api/v1/patients`
- `GET /api/v1/patients/{id}`
- `PUT /api/v1/patients/{id}`
- `DELETE /api/v1/patients/{id}`

Patient fields:
`_id, name, age, gender, contact, created_at, created_by`

## Sprint 4 — MRI Upload
Workflow:
Select patient → upload MRI → validate → preview → analyze.

Endpoint:
`POST /api/v1/predictions/analyze`

Initially allow JPG/JPEG/PNG. Validate extension, MIME type, actual readability, and configurable max size (default 5–10 MB). Store images in Cloudinary; store URLs/metadata in MongoDB, not image binaries.

## Sprint 5 — DenseNet121 Inference
Create:
`backend/app/ml/model.py`
`backend/app/ml/preprocessing.py`
`backend/app/ml/inference.py`
`backend/app/ml/weights/densenet121.pth`

Flow:
MRI → validation → Cloudinary → PIL RGB → resize → ImageNet normalization → DenseNet121 → softmax → predicted class/confidence → MongoDB → response.

Example response:
```json
{
  "prediction": "MildDemented",
  "confidence": 0.941,
  "probabilities": {
    "NonDemented": 0.012,
    "VeryMildDemented": 0.021,
    "MildDemented": 0.941,
    "ModerateDemented": 0.026
  },
  "model": "DenseNet121",
  "model_version": "1.0"
}
```

## Sprint 6 — Results and History
Implement prediction result page, MRI preview, prediction/confidence/probabilities, timestamp, model/version, prediction history, patient-specific history.

Endpoints:
- `GET /api/v1/predictions`
- `GET /api/v1/predictions/{id}`
- `GET /api/v1/patients/{id}/predictions`

Dashboard stats:
Total patients, total scans, and counts by all four classes. Use Recharts where useful.

## Sprint 7 — Production hardening
Implement global errors, structured logging, request validation, restricted CORS, JWT security, file validation, environment config, API versioning, health checks, model versioning, inference timing, proper status codes, and frontend loading/error/empty states.

Never commit `.env`, credentials, `node_modules`, `__pycache__`, or private secrets. Use deployment environment variables.

## Sprint 8 — Deployment
Frontend: Vercel.
Backend: Render.
Database: MongoDB Atlas.
Images: Cloudinary.

Do not force PyTorch inference into Vercel serverless functions merely to use one platform. Use Vercel for React and Render for FastAPI/ML.

## Frontend pages
- `/login`
- `/register`
- `/dashboard`
- `/patients`
- `/patients/:id`
- `/analyze`
- `/predictions`
- `/predictions/:id`
- `/profile`

Components should include reusable Navbar, Sidebar, ProtectedRoute, PatientTable/Card, UploadZone, MRIViewer, AnalysisResult, ProbabilityChart, PredictionHistory, StatsCard, Loading/Error/Empty states, and ConfirmationModal.

Keep the UI clean, minimal, professional, responsive, accessible, and medical-dashboard oriented. Clearly label AI output as decision-support information.

## Backend rules
Use routers, schemas, services, models, database layer, and ML layer. `main.py` should primarily create/configure the app and register routers. Use `/api/v1/`. Use Pydantic request/response schemas and consistent errors.

## MongoDB collections
`users`: `_id, name, email, password_hash, role, created_at`
`patients`: `_id, name, age, gender, contact, created_at, created_by`
`predictions`: `_id, patient_id, image_url, predicted_class, confidence, probabilities, model, model_version, inference_time_ms, created_at, created_by`

Add indexes for email, patient ID, and prediction creation date where appropriate.

## Medical safety
Do not present predictions as confirmed diagnosis. Use wording such as “AI-assisted MRI classification” and “This result is for research/decision support and should be reviewed by a qualified medical professional.” Do not provide treatment/medication recommendations from the classification alone.

## Future Federated Learning
Do not implement FL during the initial application phase. Preserve the centralized DenseNet121 as the baseline. Later use Flower + PyTorch + FedAvg:
centralized model → simulated clients → local training → FedAvg → global model → comparison.

## Definition of done
The centralized system is complete only when authentication, patient management, MRI upload, validation, Cloudinary storage, DenseNet121 inference, MongoDB persistence, history, dashboard stats, responsive UI, error/security handling, Vercel frontend deployment, Render backend deployment, MongoDB Atlas, Cloudinary, health check, and README/deployment documentation all work end-to-end.
