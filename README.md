# NeuroLens — Federated MRI Classification Simulation

NeuroLens is a research/education web platform for experimenting with federated learning on an existing four-class MRI image-folder dataset. It simulates three hospital clients, performs local training and FedAvg aggregation, tracks global model versions, and displays actual experiment history.

**Scope note:** the three hospitals are simulated data partitions on one machine. This project is not a clinically validated diagnostic system and the simulation does not provide formal privacy guarantees.

## Planned/implemented core capabilities

- Admin research workspace for dataset audits, experiment configuration, rounds, client status and model versions.
- Three fixed hospital client workspaces with client-scoped visibility.
- Local PyTorch training and federated averaging via Flower/FedAvg or a tested equivalent.
- Persisted experiment and round status, local/global metrics, checkpoint hashes and audit events.
- Reproducible dataset audit and split manifests, kept outside source control.
- Centralized baseline versus federated comparison using the same held-out data.

Feature status must follow the implementation; do not claim a capability is completed until it works end-to-end.

## Stack

- Frontend: React, Vite, React Router, Axios, Recharts, Lucide React.
- Backend: FastAPI, PyTorch/Torchvision, Pydantic, MongoDB Motor, JWT/password hashing.
- Federated engine: Flower/FedAvg, with dependency versions pinned for compatibility.
- Persistence: MongoDB for metadata; private configured artifact storage for checkpoints.
- Local development: frontend and backend can run as separate processes; the training worker must run outside HTTP request handlers.

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
# Activate the virtual environment using your OS-specific command.
pip install -r requirements.txt
# Configure backend environment values from the current .env.example and docs.
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The exact environment variables and dataset-audit commands must be documented in the backend and dataset documentation as implementation lands. Never commit real .env files, credentials, dataset files, derived images, manifests containing private local paths, or checkpoints.

## Dataset setup and experiment protocol

The existing local four-class dataset has folders named `Non Demented`, `Very mild Dementia`, `Mild Dementia`, and `Moderate Dementia`. Configure its root through a backend environment variable such as `NEUROLENS_DATASET_ROOT`; do not hardcode a developer-specific Windows path.

Before training, audit images, counts, corrupt files, hashes, duplicates and possible source/augmentation relationships. Split grouped source images into a target 70% training / 15% validation / 15% test, then divide the training portion into three clients. Use held-out validation/test data for all comparisons. Details: [Dataset and Federation Protocol](docs/dataset-and-federation.md).

Do not assume that a directory named `oasis-1 augmented` is the official raw OASIS-1 release. Record provenance uncertainty in the experiment. The old DenseNet121 benchmark is not a current result on this dataset.

## Architecture and API

- [Architecture](docs/architecture.md)
- [API contract](docs/api.md)
- [Model and evaluation protocol](docs/model.md)
- [Dataset and federation protocol](docs/dataset-and-federation.md)
- [Antigravity implementation instructions](docs/instructions.md)
- [Backend notes](backend/README.md)
- [ML directory notes](ml/README.md)

## Scientific and privacy limitations

This is a single-machine simulation of three clients, not a live multi-hospital deployment. Data partitions and source IDs depend on the audit. If patient IDs do not exist, patient-level generalization cannot be claimed. Model updates may leak information; this version does not implement secure aggregation or differential privacy. Always report actual evaluation protocol and per-class metrics. Do not present a model output as a confirmed diagnosis.
