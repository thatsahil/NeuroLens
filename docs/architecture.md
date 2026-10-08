# NeuroLens System Architecture

## Overview
NeuroLens is an AI-assisted Alzheimer's Disease MRI classification web application powered by a pre-trained PyTorch DenseNet121 model. It is designed to assist medical practitioners in categorizing brain MRI scans into 4 clinical dementia stages:
1. NonDemented (Class 0)
2. VeryMildDemented (Class 1)
3. MildDemented (Class 2)
4. ModerateDemented (Class 3)

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   React + Vite Frontend                      │
│ (React Router, Axios, Recharts, Lucide, Gemini API Client)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Server                    │
│ (Uvicorn Async ASGI Engine, Pydantic Request/Response Models)│
├──────────────────────────────┬──────────────────────────────┤
│  Image Preprocessing         │  DenseNet121 Model Engine    │
│  (PIL RGB, 224x224, ImageNet)│  (Loaded once into VRAM/RAM) │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│   Cloudinary Storage Media   ││   MongoDB Atlas Database    │
│   (Or Data URI Encoding)     ││ (users, patients,           │
│                              ││  predictions collections)   │
└──────────────────────────────┘└─────────────────────────────┘
```

## Data Flow
1. Practitioner selects patient & uploads MRI scan (JPG/JPEG/PNG).
2. Backend validates image format, size (<10MB), and PIL readability.
3. Image is stored in Cloudinary (returning secure CDN URL).
4. Image is passed to DenseNet121 model (resized to 224x224, normalized using ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`).
5. DenseNet121 runs forward pass in `eval()` mode with `torch.no_grad()`.
6. Softmax converts output logits into class probability scores across all 4 stages.
7. Prediction metadata and probabilities are stored in MongoDB.
8. Frontend renders MRI viewer, class probabilities, Recharts breakdown, and triggers optional Google Gemini AI decision support.
