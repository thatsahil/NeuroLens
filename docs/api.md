# NeuroLens API Specification

Base Endpoint: `/api/v1`

## Health Check
- `GET /health`
  - Response: `{ status: "healthy", version: "1.0.0", model_loaded: true, device: "cpu" }`

## Auth
- `POST /auth/register`
  - Body: `{ name, email, password, role }`
  - Response: `{ access_token, token_type: "bearer", user: { _id, name, email, role, created_at } }`
- `POST /auth/login`
  - Body: `{ email, password }`
  - Response: `{ access_token, token_type: "bearer", user }`
- `GET /auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: User Object

## Patients
- `GET /patients?search={query}`
- `POST /patients`
  - Body: `{ name, age, gender, contact }`
- `GET /patients/{id}`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`

## Predictions
- `POST /predictions/analyze`
  - Form Data: `patient_id` (str), `file` (UploadFile)
  - Response:
```json
{
  "_id": "pred_12345678",
  "patient_id": "pat_001",
  "patient_name": "Eleanor Vance",
  "image_url": "https://res.cloudinary.com/...",
  "predicted_class": "MildDemented",
  "confidence": 0.941,
  "probabilities": {
    "NonDemented": 0.012,
    "VeryMildDemented": 0.021,
    "MildDemented": 0.941,
    "ModerateDemented": 0.026
  },
  "model": "DenseNet121",
  "model_version": "1.0",
  "inference_time_ms": 118.4,
  "created_at": "2026-10-08T15:20:00Z",
  "created_by": "Dr. Sarah Connor"
}
```
- `GET /predictions`
- `GET /predictions/{id}`
- `GET /predictions/patient/{patient_id}`

## Analytics
- `GET /reports/stats`
  - Response: `{ total_patients, total_scans, class_counts: { NonDemented, VeryMildDemented, MildDemented, ModerateDemented } }`
