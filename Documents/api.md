# API Specification

Base path: `/api/v1`

## Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Protected endpoints use:
`Authorization: Bearer <JWT>`

## Health
`GET /health`
```json
{"status":"healthy"}
```

## Patients
- `GET /patients`
- `POST /patients`
- `GET /patients/{patient_id}`
- `PUT /patients/{patient_id}`
- `DELETE /patients/{patient_id}`

## Predictions
- `POST /predictions/analyze` — multipart form data containing patient ID and MRI image
- `GET /predictions`
- `GET /predictions/{prediction_id}`
- `GET /patients/{patient_id}/predictions`

## Analyze response
```json
{
  "id": "prediction-id",
  "patient_id": "patient-id",
  "image_url": "https://...",
  "prediction": "MildDemented",
  "confidence": 0.941,
  "probabilities": {
    "NonDemented": 0.012,
    "VeryMildDemented": 0.021,
    "MildDemented": 0.941,
    "ModerateDemented": 0.026
  },
  "model": "DenseNet121",
  "model_version": "1.0",
  "inference_time_ms": 185,
  "created_at": "..."
}
```

## Error format
```json
{
  "detail": {
    "code": "INVALID_FILE",
    "message": "The uploaded file is not a supported image."
  }
}
```

Use appropriate HTTP status codes: 400, 401, 403, 404, 413, 422, 500.

Never expose stack traces or secrets.
