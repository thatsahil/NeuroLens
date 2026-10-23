# NeuroLens — Federated MRI Classification Research Platform

NeuroLens is a federated-learning research dashboard designed to explore multi-client collaborative training and model aggregation on four-class MRI dementia data. It provides role-specific workspaces for a central administrator and three institutional hospital partitions (`hospital_1`, `hospital_2`, `hospital_3`), manages model lineage from Global Round 0 to Round 1 (DenseNet121 FedAvg), and provides append-only security auditing.

> **Research Scope & Limitations:**
> The three hospital clients are simulated local data partitions on a single machine for research demonstration. This prototype is not a clinically certified medical device and does not claim patient-level generalization or formal differential privacy.

---

## Architecture & Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Axios, Recharts, Lucide React, Tailwind CSS with the official research palette (`#99CDD8`, `#DAEBE3`, `#FDE8D3`, `#F5C3B2`, `#CFD6C4`, `#657166`).
- **Backend**: FastAPI, PyTorch 2.x, Torchvision, Pydantic v2, Motor / PyMongo, PyJWT, passlib/bcrypt.
- **Model Architecture**: Exact federated DenseNet121 with single `Linear(1024, 4)` head and strict class mapping (`Mild Dementia`: 0, `Moderate Dementia`: 1, `Non Demented`: 2, `Very mild Dementia`: 3).
- **Federation Strategy**: Sample-count-weighted Federated Averaging (FedAvg).

---

## Verified Seeded Accounts

The application provides four fixed research accounts. Public self-registration is permanently disabled:

| Role | Account Email | Initial Credentials | Workspace Scope |
|---|---|---|---|
| Central Admin | `admin@neurolens.org` | `AdminSecurePassword2026!` | Global overview, experiments, models, audit logs |
| Hospital Alpha | `hospital1@neurolens.org` | `Hospital1Password2026!` | Scoped strictly to `hospital_1` shard |
| Hospital Beta | `hospital2@neurolens.org` | `Hospital2Password2026!` | Scoped strictly to `hospital_2` shard |
| Hospital Gamma | `hospital3@neurolens.org` | `Hospital3Password2026!` | Scoped strictly to `hospital_3` shard |

---

## Local Developer Setup (Zero Virtual Environment)

As per system architectural constraints, **do not create a Python virtual environment** (`venv`, `.venv`, or `conda`). Run directly against the active Python installation.

### 1. Backend Setup & Seeding

```powershell
# Verify Python and Pip
python --version
python -m pip --version

# Install dependencies if not already present in active Python
python -m pip install -r backend/requirements.txt

# Ensure backend/.env exists (copied from backend/.env.example)
Copy-Item backend/.env.example backend/.env

# Seed the 4 fixed accounts, initial model metadata and hospital entities
python backend/app/scripts/seed_users.py
python backend/app/scripts/register_initial_models.py

# Launch FastAPI backend server
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Backend endpoints:
- Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### 2. Frontend Setup

In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Scientific Transparency & Evaluation

Global Round 1 was structurally validated against the single-layer DenseNet121 architecture. Central evaluation metrics are explicitly marked as **"Not evaluated"** until an evaluation protocol is executed over the centralized held-out validation set. No simulated or fabricated accuracy curves are shown.
