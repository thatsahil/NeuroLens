# System Architecture

## Production architecture
```text
User
 │
 ▼
Vercel
React + Vite
 │ HTTPS REST API
 ▼
Render
FastAPI
 ├── MongoDB Atlas
 ├── Cloudinary
 └── DenseNet121
```

## Request flow
```text
MRI upload
→ React
→ POST /api/v1/predictions/analyze
→ authentication
→ file validation
→ Cloudinary
→ preprocessing
→ DenseNet121
→ softmax probabilities
→ prediction/confidence
→ MongoDB
→ JSON response
→ React result UI
```

## Backend layers
```text
API router
→ schema validation
→ service layer
→ database / ML / storage services
```

Do not put complete business logic in `main.py`.

## Frontend layers
```text
Pages
→ reusable components
→ hooks/context
→ API services
→ FastAPI
```

## ML flow
```text
MRI → PIL RGB → 224×224 → ToTensor → ImageNet normalization → DenseNet121 → logits → softmax → probabilities
```

## Future federated architecture
```text
Global DenseNet121
      │
    FedAvg
      │
 ┌────┼────┐
 ▼    ▼    ▼
A     B    C
│     │    │
└─ local training ─┘
```
