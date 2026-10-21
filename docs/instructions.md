# NeuroLens — Antigravity Implementation Instructions

## Product goal

Redesign NeuroLens from a patient-centric, centralized MRI classification app into a real, reproducible federated-learning simulation over the existing four-class MRI image-folder dataset stored locally under a folder currently named oasis-1 augmented.

The product must include:
- One administrator account with access to all experiments, all simulated hospitals, round metrics, checkpoints, and audit events.
- Three hospital accounts/clients. For the first version these are simulated partitions on one machine; do not imply that three real hospitals supplied independent data.
- Backend-managed training using PyTorch and Flower/FedAvg (or a compatible, tested equivalent if Flower integration conflicts with the existing environment).
- Persisted experiment status, round history, client metrics, global model versions, checkpoint metadata and errors.
- A professional, responsive React frontend and documented FastAPI APIs.
- One canonical lowercase docs/ directory. Do not recreate Documents/.

This is a research/education simulator, not a clinically validated diagnostic system or a production privacy guarantee.

## Repository assessment and implementation decisions

Existing stack: React + Vite, React Router, Axios, Recharts, Lucide React; FastAPI, PyTorch/Torchvision, Pydantic, MongoDB Motor, JWT, Cloudinary. Keep the existing stack unless there is a demonstrated need to change it.

The current app centers on doctor/patient CRUD, individual image prediction, reports, DenseNet121 inference and direct frontend Gemini-key handling. Those are no longer the main product. Reuse sound layouts, API client, database/configuration code, auth components, chart primitives and reusable loading/error states where useful; replace patient-centric pages and domain logic that no longer fit.

Critical defects observed during repository inspection:
1. backend/app/ml/inference.py can create/save generic or random initial weights when a required checkpoint is missing, then falls back to a random model on load failure. Remove this fallback. Missing/invalid required weights must produce a clear error; never label an untrained model as loaded.
2. backend/app/core/config.py has an insecure default JWT secret and a localhost database default. Require environment configuration outside explicit local development and validate settings at startup.
3. backend/app/services/auth_service.py allows user-submitted roles, can fall back to in-memory accounts, and fabricates a default mock doctor when a token subject is absent. Remove role self-assignment and production mock-identity behavior.
4. frontend/src/context/AuthContext.jsx stores Gemini keys in localStorage and accepts a Vite-exposed API key. Remove all browser-side API key handling. Any external credentials must be backend-only environment variables. The federated MVP does not need Gemini.
5. README currently claims production readiness and a 99.04% DenseNet121 benchmark. Treat that number as a historical result on the old dataset, not verified performance on the current folder dataset. Remove unsupported clinical/production claims from active UI and docs.

## Dataset scope

The user already has a four-folder image dataset whose displayed class directories are:
- Mild Dementia
- Moderate Dementia
- Non Demented
- Very mild Dementia

Do not require another dataset download for the MVP. Do not assume the local directory is the official raw OASIS-1 release until provenance is verified. Configure the dataset root through an environment/config setting such as NEUROLENS_DATASET_ROOT. Dataset images, copied/derived images, private manifests, caches, checkpoints and credentials must not be committed to Git.

Dataset ingestion must:
- Use an explicit deterministic class map; never use filesystem iteration order for class indices.
- Read the actual supported image formats present (at least JPG/JPEG/PNG unless audit shows another format is needed).
- Count images per class; detect undecodable files; report dimensions, modes, hashes and class imbalance.
- Detect byte-identical duplicates and inspect likely augmented/source-image relationships using names/metadata.
- Create a local dataset audit report and manifest with relative path, normalized label, SHA-256, augmentation/source group if identifiable, split, client ID and exclusion reason.
- Fail with a helpful error if unexpected folders/classes are found or a class has too few independent groups for a defensible split.
- Never use test metrics to tune settings, select checkpoints or choose hyperparameters.

Required split protocol:
1. Audit and deduplicate.
2. Identify source-image groups (original plus augmented copies) where possible.
3. Make grouped train/validation/test partitions before any hospital client partition. Initial target: 70% train, 15% validation, 15% test by source group, stratified by class when feasible; deterministic seed defaults to 42 and is configurable.
4. Keep all known augmented variants with their source image. Prefer genuine original images for validation/test. If lineage cannot be inferred, explicitly report leakage risk; do not claim patient-independent evaluation.
5. Partition training only into three simulated clients. Baseline allocation is balanced per class, with source groups indivisible. Add optional non-IID/Dirichlet distribution with configurable alpha (starting value 0.5) after baseline tests pass. Guard against empty or unusably small client partitions.
6. Validation and test data stay in a central held-out set and never appear in client training.
7. Save split_manifest.csv and configuration/hash/class counts locally, not in source control. Add tests proving no source group crosses splits and no held-out file appears in a client shard.

Do not claim patient-level separation unless true patient IDs exist and are used. Use accurate terms such as source-image-group split or image-level split with augmentation-family grouping based on audit findings.

## ML experiment design

- Start with a clean 2D image-classification baseline. Recommend ResNet18, which is suitable for the existing image folders. Support generic ImageNet initialization as a configurable baseline and random initialization as a separate experiment. Do not load the old Alzheimer's checkpoint unless its architecture, class order, source data and preprocessing are verified as compatible.
- Use exactly the four folder-derived classes. Persist their explicit mapping per run; do not infer a different clinical diagnosis label from folder names.
- All clients in a run must share the same architecture, state-dict structure, label mapping, preprocessing and initial global weights.
- Augment training examples only. Do not apply random augmentation to validation/test.
- Persist Python, NumPy and PyTorch seeds and enable deterministic settings where feasible; document remaining sources of nondeterminism.
- Calculate actual loss, accuracy, balanced accuracy, macro-F1, per-class precision/recall/F1, confusion matrix and class support. Accuracy alone is insufficient for an imbalanced dataset.
- Never hardcode, fabricate, smooth or randomly generate dashboard metrics.
- Checkpoint metadata includes run ID, architecture, initialization, class mapping, preprocessing version, dataset manifest hash, split configuration, seed, round, metrics, timestamp, checkpoint SHA-256 and library versions.
- Save every successful global version atomically; do not overwrite history or register incomplete checkpoints as active.
- Compare FedAvg with a centralized baseline trained on the union of exactly the same training partitions and evaluated on the same held-out data.

## Federated learning behaviour

Use Flower with PyTorch and FedAvg if compatible, pin compatible versions, and isolate the client/strategy interface for unit tests. This first release is a single-machine simulation: three client instances/processes read only their assigned local training indices/shards. Only model parameters/updates and explicitly approved scalar metrics go to the coordinator. Raw images do not move between client partitions.

Successful round lifecycle:
1. Load the same global model checkpoint/version into selected clients.
2. Train every client's local model only on its assigned training data.
3. Collect parameter weights, actual train metrics, examples used, status and elapsed time.
4. Validate round completion and parameter structure.
5. Apply sample-count-weighted FedAvg. Handle non-floating buffers such as BatchNorm counters safely; do not naïvely average integer buffers.
6. Save a new global checkpoint/version atomically.
7. Evaluate global model on central validation data and persist actual metrics.
8. Persist round status, participants, elapsed time, model version, checkpoint hash and errors.

If any client fails, the default MVP policy is to abort aggregation for that round and visibly record the failure. Never quietly count a failed client as successful. Support cancellation between rounds and queued/running/failed/completed state. Do not run long epochs inside an HTTP request handler.

Document that model updates can leak information. This simulator does not implement differential privacy, secure aggregation, or independent real-hospital network boundaries. It does not provide formal privacy guarantees.

## Roles and security

Roles are admin and hospital. Each hospital account maps to one immutable client ID: hospital_1, hospital_2 or hospital_3. Admin can see all experiments and clients. Hospital accounts can see only their own shard summary, participation and local metrics; they cannot read another client's metrics, partition files, account or artifact. Enforce authorization in backend services/endpoints, not only by hiding frontend navigation.

- Disable public role self-registration or ignore client-submitted role.
- Seed one admin and three hospital accounts via a one-time CLI/script with password inputs and secrets supplied through environment variables or an interactive prompt. Never commit plaintext credentials or default passwords.
- Do not return filesystem paths or per-image manifests from public APIs.
- Use request validation, bounded pagination, consistent errors and audit logs.
- Remove all browser-side Gemini API-key state and settings.
- Fix permissive CORS and unsafe JWT defaults; fail startup for missing production secrets.
- Use the term simulated client/hospital in the UI and documentation.

## Target frontend experience

Keep React/Vite, Router, Axios, Recharts and Lucide unless code inspection proves otherwise. Use the existing palette:
- #99CDD8 pale blue
- #DAEBE3 mint
- #FDE8D3 warm cream
- #F5C3B2 muted coral
- #CFD6C4 sage
- #657166 muted forest/gray

Use a calm, light scientific design with clear typography, generous spacing and restrained accents. Avoid generic neon/black AI visuals. Include keyboard focus, semantic forms, appropriate contrast, responsive layouts and real loading/empty/error states.

Admin screens:
- Admin overview with experiment counts/status, latest global version, current round, actual validation metrics, three client readiness/participation cards and real training history graphs.
- Experiments list with status, date, dataset/split/model/algorithm configuration.
- Create-experiment wizard: audit readiness, split strategy, model/initialization, rounds, local epochs, batch size, learning rate, client allocation, seed and held-out test confirmation.
- Experiment detail: round timeline, participant status, local loss/metrics, sample counts, aggregate version, global validation curves, failures and checkpoint metadata.
- Model registry with run, architecture, hash, metrics and version state.
- Dataset audit page with class counts, corrupt/duplicate exclusions, split totals, client sizes and warnings.

Hospital screens:
- Own workspace showing client ID, local class/sample counts, global version, current round, local training status, local metric history and participation timeline.
- Hospital users cannot edit their client ID or browse another partition.
- Clearly label all three as simulated clients.

Remove patient CRUD, doctor profiles, clinical diagnostic workflow and patient prediction history as primary navigation; remove unused routes/components when safe. Remove all print/export buttons and supporting code, endpoints, imports, tests, CSS and dependencies. Remove Gemini UI/state/code if no longer needed. Do not leave dead code behind.

## Backend architecture

Keep main.py for app setup, lifecycle, middleware, router registration and health checks. Organize logic into domain modules, for example:
- api/: auth, admin, hospital, datasets, experiments, models
- core/: config, security, authorization
- database/
- schemas/
- services/: auth, experiment, dataset audit, model registry, audit log
- fl/: model factory, data manifest, partitioning, client, strategy, orchestrator, metrics
- workers/: training worker/process entry point

Keep training out of request handlers. Use a separate worker process or equivalent durable background execution. Persist job state before starting and after every round. Reconcile stale running jobs on restart rather than displaying them as active forever. Do not rely on in-memory dictionaries for experiment history.

Use the existing MongoDB infrastructure with collections/repositories for users, hospital_clients, dataset_manifests, experiments, training_rounds, client_round_metrics, model_versions and audit_events. Store checkpoint artifacts in a configured non-public artifact directory or an abstracted artifact store; keep metadata and hashes in MongoDB.

Suggested REST API prefix: /api/v1.
- GET /health — API/database/worker health.
- POST /auth/login, GET /auth/me, logout if token/session revocation is implemented.
- GET /admin/overview — admin only.
- GET /admin/hospitals — admin only.
- GET /datasets/audit and POST /datasets/audit — admin only; scan configured local data.
- GET /experiments and POST /experiments — role-scoped list; creation is admin only.
- GET /experiments/{id} and GET /experiments/{id}/rounds — authorized detail.
- POST /experiments/{id}/start and POST /experiments/{id}/cancel — admin only.
- GET /hospitals/me/workspace and GET /hospitals/me/rounds — hospital-scoped to the assigned client.
- GET /models and GET /models/{id}; model activation/selection is admin only.

Keep OpenAPI, schemas and frontend API clients consistent. API responses must contain persisted real metrics, never fixture metrics once integrated.

## Implementation phases

Phase 0 — inventory and branch:
- Work on redesign/federated-mri-simulation, not main.
- Search all routes, APIs, components, dependencies and references to patients, old model claims, print/export and Gemini.
- Preserve reusable code and keep the docs directory canonical.

Phase 1 — dataset audit:
- Implement local CLI/audit configuration.
- Inspect classes, images, corrupt files, duplicates, augmentation lineage and imbalance.
- Create grouped 70/15/15 split and three train-only client partitions.
- Add deterministic/no-overlap/no-leakage tests.

Phase 2 — model baseline:
- Implement data loader, explicit label map, ResNet18 factory, train/evaluate scripts, metrics and versioned checkpoint.
- Run centralized baseline on the union of training shards before FL.

Phase 3 — federated core:
- Implement three clients, Flower/FedAvg, round lifecycle, weighted aggregation, central validation, checkpoint registry, failure and cancellation behaviour.
- Test one round against a tiny synthetic fixture, then run a real-data smoke test.
- Verify clients begin each round from the same current global version.

Phase 4 — persistence, worker and APIs:
- Add experiment/round/metrics/model/audit persistence.
- Add durable worker lifecycle, status polling, cancellation and stale-run handling.
- Safely seed accounts and enforce role/client authorization.
- Add API state-transition and authorization tests.

Phase 5 — frontend:
- Replace patient navigation with admin research and hospital workspaces.
- Connect all screens to real APIs and persisted metrics.
- Implement experiment wizard, progress, timeline and model registry.
- Remove unused patient/inference/report/Gemini functionality and all print/export code.
- Apply palette and accessibility requirements.

Phase 6 — verification:
- Unit test audit, source grouping, split, model factory, metrics, FedAvg weighting and checkpoint load/save.
- Integration test start/cancel/round persistence and authorization.
- Run backend tests, frontend lint/build and smoke tests.
- Search for stale claims, mock graphs, window.print, print CSS, export helpers, Gemini key/localStorage, mock identities and obsolete routes.
- Verify restart preserves history and invalid checkpoints never appear active.
- Update README and all docs to reflect real behaviour and limitations.

## Definition of done

1. Dataset audit reports honest per-class counts, exclusions and a reproducible manifest.
2. Known source groups do not cross train/validation/test; no held-out file enters a client shard.
3. All three clients train only on their own assigned training data.
4. FedAvg aggregates actual client parameters and dashboard metrics are computed from actual runs.
5. Centralized and federated models use the same held-out split; test evaluation happens only after model selection.
6. A restart preserves completed experiment history and model metadata.
7. Admin can create/start/cancel a run and inspect all clients, rounds, metrics and model versions.
8. Hospital accounts can only access their own workspace/client metrics.
9. No self-selected roles, mock-user fallback, unsafe JWT default or frontend secret remains.
10. No unused patient/print/export/Gemini implementation remains in scope.
11. Build/tests pass; README/docs explain dataset provenance and leakage/privacy limits.

## Canonical documentation

Keep all project docs under lowercase docs/ only:
- docs/instructions.md — this implementation brief.
- docs/architecture.md — components and flows.
- docs/api.md — REST contract.
- docs/model.md — labels, model, preprocessing, metrics/checkpoints.
- docs/dataset-and-federation.md — audit/split/client/experimental protocol.

Do not recreate Documents/. Root README is the entry point and uses relative Markdown links.
