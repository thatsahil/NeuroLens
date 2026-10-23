# NeuroLens — Antigravity Implementation Plan

## Mission

Refactor the existing `thatsahil/NeuroLens` repository into a clean federated-learning research dashboard. Keep the sound parts of the existing stack, replace the old patient/doctor-centered product flow, integrate the already-created Global Round 1 DenseNet121 checkpoint, and provide four fixed logins: one administrator and three hospital client accounts.

This is an implementation brief, not a request for another plan. Inspect the repository, make the changes in code, run the available checks, fix issues, and report what is actually working. Do not claim a feature is complete until it works end to end.

## Non-negotiable constraints

1. **Do not create a Python virtual environment.** Do not run `python -m venv`, `virtualenv`, `conda create`, or similar commands. Use the already-active local Python installation. Inspect installed versions first and avoid reinstalling large packages such as PyTorch if compatible versions are already available. Frontend `npm install` is allowed; the no-virtual-environment constraint refers to Python environments.
2. **Do not launch training automatically.** Global Round 1 already exists. On first startup, import/register it as the active model and show the pipeline as complete through Round 1. Do not start or repeat local training, aggregation, or a new federation round on startup. Future rounds can be triggered explicitly by an authenticated admin.
3. **Never commit model checkpoints, datasets, private manifests, `.env` files, API keys, passwords, tokens, or credentials to Git.** Keep artifacts outside public/static frontend folders.
4. **Never expose or request a third-party API key in the frontend.** If the AI assistant remains, configure the key only in the backend environment and proxy requests through FastAPI. Remove the frontend key form, `VITE_GEMINI_API_KEY`, direct browser SDK calls, and local-storage key persistence.
5. **Never silently substitute pretrained or random weights when the required global checkpoint is missing or incompatible.** Fail clearly, record the error, show the model as unavailable, and do not make predictions until the exact intended checkpoint loads successfully.
6. Do not fabricate metrics or claim that Global Round 1 is more accurate than Round 0. Only display measurements that were genuinely calculated with a documented evaluation protocol. Show “Not evaluated” where a valid global evaluation result is absent.
7. The “hospitals” are simulated client workspaces on a single machine in this prototype. Do not imply that three independent real hospitals have connected or that the workflow has formal privacy guarantees.
8. Preserve the repository’s existing work until the replacement paths pass tests. Review `git status` and create a safe working branch or checkpoint before broad refactors. Do not force-push or overwrite remote history.

## Repository links and starting point

- Repository: https://github.com/thatsahil/NeuroLens
- Shared Drive folder supplied by the project owner: https://drive.google.com/drive/folders/1qB9eEVyPz-UXjTm7hQJAL0lrdfdtW5X0?usp=sharing

The repository currently contains React + Vite, React Router, Axios, Recharts and Lucide on the frontend, plus FastAPI, PyTorch/Torchvision, Pydantic, MongoDB Motor and JWT/password hashing on the backend. Keep these unless an actual technical blocker is demonstrated; do not introduce an unnecessary framework rewrite.

The current frontend still includes patient CRUD, doctor-style login/registration, scan-analysis/predictions pages, and `GeminiAssistant.jsx` with direct browser Gemini calls and a key-entry form. The current backend still exposes patient/prediction/report APIs and has insecure development fallbacks. Refactor those parts to the new federated product, reusing useful shared components and services where appropriate.

Try to inspect the shared Drive folder if it is accessible in the local environment. If it is not mounted or permissions prevent access, do not pretend the artifacts were inspected. Continue implementing the app, document exactly where the owner should place the exported files, and make artifact availability configurable.

## Existing federated artifacts to support

The current verified artifacts were created under the project’s Google Drive folder, named `Mega Project`. The anticipated structure is:

```text
Mega Project/
├── global_models/
│   ├── global_model_round_000.pth
│   ├── global_model_round_000.json
│   ├── global_model_round_001.pth
│   └── global_model_round_001.json
├── hospital_outputs/
│   ├── hospital_1/
│   │   ├── client_weights.pth
│   │   └── client_metadata.json
│   ├── hospital_2/
│   │   ├── client_weights.pth
│   │   └── client_metadata.json
│   └── hospital_3/
│       ├── client_weights.pth
│       └── client_metadata.json
└── deployment/
    └── neurolens_global_round_001.zip
```

Do not hardcode a developer-specific absolute Drive path into application code. Configure the private artifact root via an environment variable such as `NEUROLENS_ARTIFACT_ROOT`. The app must also accept an explicitly configured active checkpoint path or a controlled import of the deployment package.

The currently verified Global Round 1 checkpoint details:

- Project: `NeuroLens`
- Model: `DenseNet121`
- Round: `1`
- Aggregation method: `FedAvg`
- Client IDs: `hospital_1`, `hospital_2`, `hospital_3`
- Training sample counts: 22,769; 23,623; 23,073
- Total training samples: 69,465
- FedAvg weights: 0.3277765781; 0.3400705391; 0.3321528827
- Global Round 0 SHA-256: `5c35dbf9eafa1ef1c923b603d2d44318aadd3abf2756275b0fd159ff0c9cc754`
- Global Round 1 SHA-256: `2edb86fe68e5ae29af5bd70eebb5b0262cc6abc698e90b1c7db91a4f5dbca360`
- Round 1 checkpoint size: about 27.10 MB
- Expected state dictionary: 727 tensors
- Classifier weight shape: `(4, 1024)`
- Classifier bias shape: `(4,)`

Treat these values as expected artifact metadata for validation, not as evidence of evaluation accuracy. Verify file hashes against the actual bytes whenever artifacts are imported. Do not hardcode “complete” based only on constants if files are missing.

## Critical model compatibility requirement

The existing `backend/app/ml/model.py` creates a DenseNet121 classifier with two layers (`Linear(1024, 512)`, ReLU, Dropout, then `Linear(512, 4)`). That structure is **not compatible** with the verified federated checkpoint, which uses a single `torch.nn.Linear(1024, 4)` classifier. The current class names/order also differ from the checkpoint’s class mapping.

Implement a dedicated checkpoint-compatible model factory for the federated model:

```python
from torchvision import models
from torch import nn

model = models.densenet121(weights=None)
model.classifier = nn.Linear(1024, 4)
state = torch.load(checkpoint_path, map_location="cpu", weights_only=True)
model.load_state_dict(state, strict=True)
model.eval()
```

Use compatible imports/types for installed Torch versions. Do not use pretrained initialization when loading a full state dict. Verify the checkpoint SHA-256, state-dict keys, tensor shapes and finite values at import/startup. For inference, apply exactly the preprocessing used in training: RGB, resize to 224×224, tensor conversion, then normalization with mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.

**Use the checkpoint’s exact explicit class mapping:**

```json
{
  "Mild Dementia": 0,
  "Moderate Dementia": 1,
  "Non Demented": 2,
  "Very mild Dementia": 3
}
```

Never infer class order from filesystem order. Do not map this to the old `NonDemented`, `VeryMildDemented`, `MildDemented`, `ModerateDemented` order. Update the backend model, prediction response, UI display labels and tests together. If the project no longer needs individual-image inference, keep this model loader and model registry but do not rebuild the old clinical workflow merely for compatibility.

If model inference stays in the MVP, label it as an experimental research output, not a confirmed diagnosis. Do not claim clinical safety/validity based on checkpoint loading alone.

## Product roles and authentication

There must be exactly four seeded application accounts in the first version:

- One `admin` account.
- Three `hospital` accounts permanently assigned to `hospital_1`, `hospital_2`, and `hospital_3`.

A shared login page can serve all four roles. After login, route the user to the correct workspace based on the backend-authoritative role and client ID. Do not show a public role dropdown or let the request body set a role/client ID. Remove public self-registration from the frontend and backend unless an explicit administrator invitation flow is designed later.

Create a safe seed command/script for these four accounts. Use interactive password prompts or secrets supplied outside Git; store password hashes only. Never provide committed default passwords or a public “demo admin” password. Document how the project owner creates the four accounts locally.

Authorization rules:

- Admin can view all clients, rounds, experiments, audit events and model versions; import/register model versions; create/configure/start/cancel a future run; choose a valid checkpoint to activate; and see aggregation history.
- Hospital N can view only its own client ID, own local sample/class summary, local training status/metrics, participation history and the current global model version. It may see only the status relevant to its assigned client.
- Hospital accounts cannot query another hospital’s data, weights, metadata, internal file paths or client metrics. Users cannot edit their client ID or promote themselves to admin.
- Enforce every role/client access rule on the backend service/query layer and test it. Frontend route guards are only a user-experience layer.

Fix existing auth flaws: remove the insecure default JWT secret, user-submitted roles, in-memory production account fallback, and mock doctor/admin identity fallback. Require an explicit valid secret and database configuration, with a clear local-development configuration path. Keep consistent authorization errors and audit sensitive admin actions.

## Main user workflows

### Admin workflow

1. Sign in.
2. See a federated-learning overview: current active global model, current round (`Round 1` after importing the provided artifact), total known client training samples, client readiness, last aggregation status, checkpoint hash/size, and real evaluation status (or “Not evaluated”).
3. Inspect the three hospital clients and their submitted/exported artifact metadata.
4. Inspect the round timeline: Global Round 0 initialization → local client checkpoint exports → FedAvg aggregation → Global Round 1 verification → active/deployment-ready registration.
5. Open model registry and inspect each model’s version, parent version, hash, model architecture, round, aggregation metadata, client weights/sample counts, import time and evaluation state.
6. Configure a future experiment or next round only through an explicit form and confirmation. The app must not run it automatically. Show configuration, selected client list and source global model before the admin confirms.
7. Monitor queued/running/succeeded/failed/cancelled status with actual progress, per-client statuses, duration, logs/errors and persisted round events.
8. Import or activate a checkpoint only after integrity, compatibility and metadata validation. Preserve old versions immutably; activation should update an explicit active-model pointer, not overwrite old checkpoint files.

### Hospital workflow

1. Sign in to the client’s assigned workspace.
2. See a clear label such as “Simulated Hospital 2 Client”.
3. View current global model version, last/next round state, own contribution count and own local status/metrics.
4. See a short activity/history timeline of its participation and previous updates.
5. Future client training/import/upload actions must be scoped to that account/client ID and authorized on the backend. Do not let a hospital user activate the global model or start global aggregation.

## Information architecture and pages

Use a shared brand shell and role-specific navigation. Replace the old patient/doctor navigation as the primary product.

### Public
- `/login`: calm branded login form, clear errors, loading, disabled state, password visibility toggle, keyboard-friendly labels.
- No public registration page.
- Optional lightweight `/` redirect based on auth state.

### Admin pages
- `/admin/overview`: KPI cards, current global model/version, round status, three hospital status cards, actual client contributions, recent audit events, and timeline/progress visualization.
- `/admin/hospitals`: three client cards/table with assigned IDs, data/weight presence, last participation, metadata validation, status and contribution counts.
- `/admin/experiments`: filterable experiment/run history with queued/running/completed/failed/cancelled statuses.
- `/admin/experiments/new`: multi-step create/configure form for a *future* run, with safe defaults and review/confirm screen; do not auto-run.
- `/admin/experiments/:id`: round timeline, client-level states, real local metrics, aggregate weights, validation history, artifact hashes, logs and failures.
- `/admin/models`: model registry, current active model, versions, parent/child links, checksum/size, import/activation/rollback controls and actual evaluation state.
- `/admin/dataset`: dataset and client contribution audit summary; counts, splits, classes, duplicates/corruption if a manifest exists, and explicit provenance/leakage caveats.
- `/admin/audit`: append-only history for logins, model import/activation, round configuration/start/cancel/failure, aggregation and relevant settings changes.
- `/admin/settings`: backend-configured integration/health status without showing secrets in responses or allowing users to enter API keys.

### Hospital pages
- `/hospital/overview`: own client identity, global model version, client readiness, current round state and a concise participation timeline.
- `/hospital/metrics`: own local training history and class/sample counts, showing “not available” when no valid metric file exists.
- `/hospital/activity`: own participation events and artifact status.

Redirect by backend role on login. Unknown roles or missing client mapping must not gain access to a default page.

## UI and design system

Apply the previously agreed palette already documented in the repository:

- Pale blue: `#99CDD8`
- Mint: `#DAEBE3`
- Warm cream: `#FDE8D3`
- Muted coral: `#F5C3B2`
- Sage: `#CFD6C4`
- Muted forest/gray: `#657166`

Create central CSS variables/theme tokens for surfaces, text, borders, status colors, charts and focus rings. Use a calm, bright scientific dashboard—not a black/neon AI aesthetic. Suggested application style: off-white/cream canvas, white or very light mint cards, pale blue for primary interactions, sage/forest text, coral for warnings/errors only, mint for completed/healthy states. Use dark readable text and check WCAG-style contrast; pastel colors should not be used for small text over similar pastel backgrounds. Keep visual hierarchy, generous whitespace, a consistent spacing scale, modest corner radii, restrained shadows, and responsive behavior.

UX requirements:
- Desktop sidebar with a responsive mobile navigation drawer/top bar.
- Clear page title, short contextual subtitle, active workspace/client indicator and user menu.
- Avoid metric cards that invent values. Add tooltips/labels for technical items such as FedAvg weight and SHA-256.
- Charts should come from persisted API response data. Use Recharts already installed. Give axes/units, legends, accessible labels, empty states and sensible loading/error states.
- Add skeleton/loading states, clear empty states, retry affordances, form validation, confirmation before running/cancelling/activating anything, success/error toast/banner, disabled states and unsaved-change handling where appropriate.
- Accessible semantic structure, visible keyboard focus, keyboard operation, proper labels, alt text and responsive layout.
- Reuse Lucide icons; avoid decorative clutter and enormous glows.
- Keep a consistent terminology glossary: “global model”, “client/hospital”, “round”, “local update”, “FedAvg”, “model version”.

### Required dashboard visualizations

All metrics must be data-backed. At minimum provide:

1. Client contribution chart: the sample counts for each hospital.
2. FedAvg weights chart with percentages totaling 100%.
3. Global round/version timeline, with lifecycle status events, not an invented model-accuracy curve.
4. Global evaluation metrics across rounds only when those metrics were actually computed on the same valid validation set. Otherwise show a clear “Not evaluated” panel.
5. Per-client local loss/accuracy plots only if actual `training_history.csv`/metadata or database metrics exist. Do not derive fake curves from one final number.
6. Model registry size/hash/version history.
7. Client status and round success/failure summary with clear units.

Initial seeded dashboard state should display Round 0 and Round 1 metadata from verified artifacts. The UI may show that aggregation and structural validation completed. It must not show an unmeasured “accuracy improvement”, “clinical accuracy”, or “better than Round 0” claim.

## Backend architecture

Continue with FastAPI and MongoDB Motor unless the current repository makes that unworkable. Use a documented artifact root on local disk/private storage for the binary checkpoints; persist metadata/hash/status in MongoDB. Keep raw images and large model files out of MongoDB documents and public web directories.

Use a layered organization similar to:

```text
backend/app/
  main.py
  api/                 # auth, admin, hospitals, dataset, experiments, models, optional assistant
  core/                # validated config, security, authorization, logging
  database/            # Mongo lifecycle, indexes, repositories
  schemas/             # request/response validation
  services/            # auth, client, artifact/model registry, audit
  ml/                  # exact DenseNet121 factory, preprocessing, evaluation/inference
  fl/                   # clients, FedAvg, round orchestration, metrics
  workers/              # separate training/aggregation worker process entry
  scripts/              # seed users, import current model/artifact bundle, audit dataset
```

Avoid putting long-running training or aggregation inside an API handler. Persist a queued job/run first; run the operation in a worker process or equivalent durable worker. Persist progress, per-client state, output version, failure detail and timestamps. Expose progress through polling endpoints first; WebSocket/SSE is optional, not a blocker. On backend restart, reconcile stale `running` runs to a truthful recoverable/failed state instead of leaving them “running” forever.

Recommended MongoDB collections (or equivalent well-defined repositories):

- `users`: hashed password, role, immutable client ID for hospital users, created/disabled timestamps.
- `hospital_clients`: client identity, non-sensitive config, artifact status and latest contribution metadata.
- `dataset_manifests`: summary/hash/split metadata; do not expose raw local file paths.
- `experiments`: configuration, run status, creator and timestamps.
- `training_rounds`: round index, parent/new model IDs, overall state, timings, hash and errors.
- `client_round_metrics`: one client’s actual local status/counts/metrics per round.
- `model_versions`: immutable model metadata, path key, hash, architecture, class map, parent, round, evaluation and active state.
- `audit_events`: append-only security and administrative events.

Use proper indexes/unique constraints, bounded pagination, request validation, consistent errors and startup validation. Use atomic checkpoint writes to a temporary file followed by rename. Verify checksum after write. Never register an incomplete/failed checkpoint as active.

## Suggested API contract

Use `/api/v1` consistently. Align all frontend API calls and backend schemas after implementing them. At minimum:

- `GET /health`: API, database, worker and model readiness without leaking secrets or local paths.
- `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` if revocation/session logic is provided.
- `GET /admin/overview` — admin only.
- `GET /admin/hospitals` — admin only.
- `GET /admin/audit` — admin only.
- `GET /datasets/audit`, `POST /datasets/audit` — admin only; do not start training.
- `GET /experiments`, `POST /experiments` — authorization-aware; creation only configures a future run.
- `GET /experiments/{id}` and `GET /experiments/{id}/rounds`.
- `POST /experiments/{id}/start`, `POST /experiments/{id}/cancel` — admin only, explicit user action and valid state transition only.
- `GET /hospitals/me` and `GET /hospitals/me/metrics` — hospital-scoped; derive client ID from authenticated user, not a caller-supplied query field.
- `GET /models`, `GET /models/active`, `GET /models/{id}` — authorized reads.
- `POST /admin/models/import`, `POST /admin/models/{id}/activate` — admin only with hash, structure and metadata verification.
- Optional `POST /assistant/summary` if Gemini remains: backend-only credentials, strict rate limit, sanitized inputs, no secret returned to client. Use it for summarizing federation status, not for generating unsupported medical diagnoses.

Do not expose absolute checkpoint paths, arbitrary file paths, secrets, stack traces or another client’s artifacts in public responses.

## Federated orchestration and future iteration controls

Global Round 1 is the initial active model. The UI should present the current status as “Round 1 imported/verified” after successful checksum and compatibility checks.

A future run/round should require an explicit admin confirmation. It must:

1. Select the current active global checkpoint as the parent.
2. Validate selected clients are available and all use the same parent version, compatible architecture, state-dict keys/shapes, class mapping and preprocessing.
3. Train clients only on their assigned local train shards if the configured execution mode is local simulation. Never bring held-out validation/test images into client training.
4. Collect client states, actual sample counts/metrics, status and durations.
5. By default, abort aggregation if a required client fails; never silently include partial stale results.
6. Apply sample-count weighted FedAvg. Handle non-floating model buffers (for example BatchNorm counters) safely; do not naïvely average integer buffers.
7. Save the next global checkpoint and metadata immutably, validate hash/structure, and only then mark it available.
8. Evaluate on a consistent held-out validation set and persist real metrics.
9. Make activation a separately auditable operation or apply the clearly documented project policy.
10. Never evaluate/tune hyperparameters against the held-out final test set repeatedly. Keep validation and final test roles distinct.

For the immediate import of Round 1, do **not** rerun local training or FedAvg. Use the existing `global_model_round_001.pth` and its matching JSON metadata. If the hospital weight files are absent, show the client artifact state as unavailable instead of fabricating readiness.

## API key configuration

The API key will be configured by the project maintainer on the backend, not entered by users.

- If retaining Gemini-based assistant functionality, use `GEMINI_API_KEY` (or one consistently named backend-only setting) read by validated backend configuration.
- Keep only an empty placeholder in `.env.example`; keep the real `.env` ignored by Git.
- Remove `@google/generative-ai` from the frontend when no other frontend-only usage remains.
- Remove all `geminiApiKey`, `updateGeminiApiKey`, `neurolens_gemini_key`, `VITE_GEMINI_API_KEY`, key-entry forms, and direct Google API calls from React.
- Frontend should call a backend endpoint. Never echo keys in API responses, logs, error pages or configuration UI.
- If the backend key is unset, return a friendly disabled/configuration status. Do not prompt the user for a key. The federated dashboard itself must remain fully functional without the optional assistant.
- Do not send raw MRI images, patient names or sensitive records to a third-party LLM. Prefer summary-only prompts with minimal non-sensitive round/client metadata.

## Environment and local run requirements — no virtual environment

Update README and docs so the local workflow does not ask users to create a virtual environment. First inspect current Python/Node versions and installed package compatibility. Use the existing active Python installation, install only needed dependencies into that installation, and explain when administrator permissions or an already-installed package may be involved. Do not create `.venv`, `venv`, Conda environments or similar.

Document this style of local setup (adjust paths/commands to the final implementation):

```powershell
# From repository root — DO NOT create a virtual environment
python --version
python -m pip --version

# Inspect existing dependencies first. Install only if needed:
python -m pip install -r backend/requirements.txt

# Create a local backend .env from the example if one does not already exist.
Copy-Item backend/.env.example backend/.env
# Edit backend/.env privately; never commit it.

cd backend
python -m uvicorn app.main:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Make sure dotenv/config loading works regardless of whether the process is launched at repository root or in `backend/`; prefer a stable config path resolved relative to the backend project, but do not override a deliberate environment setting. Do not put secrets in Vite variables. Provide a health endpoint and a simple troubleshooting section for MongoDB unreachable, checkpoint missing/incompatible, missing backend API key, port conflicts and CORS. Mention that direct global Python package installs affect the active Python environment.

## Dataset/evaluation truthfulness

The initial UI is about federated orchestration and model lineage, not claiming clinical validity. Global Round 1 has been structurally checked, but the global model’s held-out test results have not yet been confirmed in the supplied history. Show “Not evaluated” until an actual evaluation artifact/API record is available.

If you surface earlier hospital local evaluation reports, label them as local client results and name their checkpoint/version and test split. Do not present them as Global Round 1 metrics. Use per-class precision/recall/F1, macro-F1, balanced accuracy, confusion matrix and support if genuine compatible reports exist. Show evaluation date, dataset/split provenance and checkpoint hash. If images are split by slice rather than patient, say so; never claim patient-level generalization without patient IDs and correct grouping.

The dataset is imbalanced and earlier local runs showed uneven per-class performance/possible overfitting. Show this as a quality/research caveat only when associated with the correct local-model/test metadata. Do not use “diagnose”, “clinically proven”, or “production-ready medical AI” as an unqualified claim.

## Data/privacy handling

- Do not commit dataset archives, images, client checkpoints, global weights, export ZIPs or local manifests to Git.
- Add/verify `.gitignore` coverage for `.env`, checkpoint formats, model artifacts, dataset paths, caches, exports and runtime logs.
- Keep model artifacts in private disk storage or a restricted artifact store, never `frontend/public` or a public static URL.
- Do not log passwords, tokens, API keys, raw MRI bytes, or private absolute paths.
- Document that this is a single-machine federated simulation. Model updates can leak information. This version does not implement secure aggregation or differential privacy.

## Implementation phases and expected outputs

### Phase 0 — Audit and baseline
- Inspect `git status`, repository tree, dependency versions, current routes/APIs, existing docs and environment settings.
- Verify which model and metadata artifacts are available without copying large files into Git.
- Record a short existing-code audit. Make a safe working branch/checkpoint.
- Do not alter model weights or run training just to test the interface.

### Phase 1 — Backend foundation and authentication
- Build validated settings and secrets handling; configure database/artifact root.
- Replace self-service registration with safe seeding of exactly the admin + three fixed hospital accounts.
- Implement server-side role/client authorization and audit logging.
- Add repository/services/schemas for experiments, clients, model versions and audit events.
- Remove insecure mock and in-memory fallback identities.

### Phase 2 — Global model registry/import
- Implement the checkpoint-compatible DenseNet121 model factory with exact class map and preprocessing.
- Implement a one-time import/registration path for the supplied Round 0/Round 1 metadata/checkpoint artifacts.
- Validate SHA-256, architecture/state-dict strict load, class mapping and metadata. Store files outside public paths.
- Register Round 1 as the current active model only after successful validation; do not start a training cycle.
- Replace random/pretrained fallback behavior with explicit errors and health status.

### Phase 3 — Federated orchestration and persisted lifecycle
- Implement durable experiment/round/client status and metadata.
- Add a separate worker process for any future long-running round. Keep it idle by default.
- Add explicit admin start/cancel controls with validation, transitions, per-client status, safe FedAvg and immutable global version writes.
- Store only metrics actually computed and add logs/errors/audit events.

### Phase 4 — UI redesign and role-specific workspaces
- Replace patient-centric primary navigation with Admin and Hospital layouts described above.
- Apply the agreed palette via central design tokens.
- Implement the dashboard charts and model/version/round timelines from persisted API data.
- Add responsive, accessible loading/empty/error/confirmation states.
- Remove the public register UI, old patient/prediction/report navigation and unused code once nothing references it.

### Phase 5 — Backend-only assistant key and cleanup
- Remove direct frontend Gemini SDK/key flow.
- If retaining an assistant, create a backend-only integration and hide/disable it cleanly when not configured.
- Remove unused frontend dependencies and dead files/imports only after checking references.
- Update `.env.example`, `.gitignore`, READMEs and docs.

### Phase 6 — Testing, local startup, documentation
- Run backend tests, frontend lint/build, API smoke tests and manual role workflows.
- Confirm app local start instructions do not create any Python virtual environment.
- Add tests for the exact active checkpoint, role isolation, state machine, FedAvg, missing artifact behavior and no-secret frontend code.
- Provide a concise final report with changed files, commands run, results, remaining configuration, any blocked Drive access and exact artifact location instructions.

## Required tests and acceptance criteria

The implementation is accepted only when all applicable checks pass:

### Model/artifact
- Global Round 1 checksum matches the supplied expected hash when importing the matching artifact.
- Round 1 loads with `strict=True` using single-layer `Linear(1024,4)` classifier; output logits have shape `[batch, 4]`.
- Exact class mapping and preprocessing are covered by tests.
- Missing checkpoint, hash mismatch, unexpected tensor shapes or invalid metadata do not create random weights and do not mark the model loaded.
- App starts without triggering a new training round.

### Auth/RBAC
- Seeded admin can view all three clients, round records and model versions.
- Hospital 1/2/3 only see their own scoped metrics and activity.
- Hospital users cannot invoke admin APIs, choose a different client ID, activate a model, or start/aggregate a global round.
- No public role self-registration or default admin password exists.
- Invalid token/missing user returns 401; it never manufactures a mock identity.

### Federated lifecycle
- Global Round 1 is visible as imported/verified and active after registration.
- Future round start requires an explicit admin action and valid configuration; no automatic training on app startup.
- Failed clients cannot be silently treated as successful aggregation participants.
- FedAvg uses validated sample counts/weights and handles non-floating buffers intentionally.
- Checkpoint writes are atomic and version history is immutable.
- Run and client statuses survive backend restart or stale jobs are clearly reconciled.

### UI and key handling
- Agreed light palette is applied consistently and is responsive/accessibility-aware.
- Admin and hospital landing pages route correctly after login.
- All charts use persisted data; missing metrics show “Not evaluated”/empty states.
- No frontend Gemini key input, `VITE_GEMINI_API_KEY`, browser SDK direct call, or Gemini key in localStorage remains.
- If configured, the backend assistant reads the key from backend environment only. If not configured, user is not asked for a key.

### Local developer workflow
- README setup does not create or activate a virtual environment.
- Backend and frontend can be launched using the documented local commands.
- `frontend` build/lint passes and backend tests/import checks pass, or any failure is reported with exact remaining fix.
- `.env`, model artifacts and dataset files remain untracked/uncommitted.

## Final response from Antigravity

At completion, report:
1. Implemented features and resulting role flows.
2. Important architecture/model compatibility changes.
3. List of files added/updated/deleted.
4. Actual commands/tests executed and their results (never just say “tested”).
5. Any required `.env` values, database setup or artifact placement still needed.
6. Exact run commands for the backend and frontend **without a Python virtual environment**.
7. Known limitations—especially evaluation status, data provenance/leakage risk, and simulated rather than real hospital clients.

Do not stop after producing another planning document. Implement the plan against the current repository.
