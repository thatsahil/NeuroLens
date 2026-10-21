# NeuroLens Architecture

## Product scope

NeuroLens is a research/education platform for a reproducible federated-learning simulation over the existing local four-class MRI image-folder dataset. It is not a clinically validated diagnostic system. The three hospital accounts represent simulated client partitions on a single machine, not three independently operated hospitals.

## System context

```text
React + Vite web app
  ├── Admin research workspace
  └── Hospital client workspaces (hospital_1 / hospital_2 / hospital_3)
           |
           | HTTPS JSON API + JWT
           v
FastAPI application
  ├── Authentication and role/client authorization
  ├── Dataset audit and split-manifest service
  ├── Experiment API and persistent experiment state
  ├── Model registry and audit events
  └── Background training worker / orchestrator
          ├── Client 1 local training shard
          ├── Client 2 local training shard
          ├── Client 3 local training shard
          ├── FedAvg coordinator
          ├── Central validation evaluator
          └── Versioned checkpoint/artifact store
           |
           ├── MongoDB: users, runs, round metrics, versions, audit events
           └── Local private artifact directory (configurable)
```

The existing React, Vite, Axios, React Router, Recharts and Lucide foundation should be retained. The existing FastAPI/PyTorch/MongoDB Motor/JWT foundation should be extended instead of rewritten without a reason. Training must run outside the API request process in a background worker/process with durable status.

## Primary request/data flow

### Dataset preparation (admin only)

```text
Configured local dataset root
  → scan explicit four-class folders
  → validate/decode and hash files
  → identify exact duplicates / source-augmentation groups
  → create grouped train/validation/test manifest
  → create three client shards from training partition only
  → persist audit summary + manifest hash
```

Expected current display folders:
- Non Demented
- Very mild Dementia
- Mild Dementia
- Moderate Dementia

Use an explicit normalized label map. Do not assume provenance from the local directory name alone. If original/augmented lineage cannot be established, report the risk instead of claiming leak-free subject evaluation.

### Federated training run

```text
Admin creates experiment
  → validate audit/split configuration
  → persist queued experiment
  → background worker starts round N
  → load same global model version into all clients
  → client-local training on each client's own training shard
  → clients return model parameters + approved aggregate metrics
  → coordinator validates participation/parameter compatibility
  → sample-count-weighted FedAvg
  → atomically save global version N+1
  → evaluate global model on central validation set
  → persist metrics, hashes, events and round status
  → repeat until configured rounds / cancel / failure
  → select checkpoint using validation data
  → evaluate selected checkpoint once on held-out test set
```

Do not put long model training inside FastAPI endpoints. Default to aborting a round if any client fails; persist the failure and do not aggregate partial results silently. Support cancellation between rounds. Recover stale worker status on restart.

## Split and client data boundaries

Use the order audit/deduplicate/group → grouped 70/15/15 train/validation/test split → partition training only into three clients. Use deterministic seed 42 by default. Keep augmented versions with their identifiable source group. Prefer original samples in held-out validation/test. All three clients must have disjoint training indices. No held-out samples may appear in a client's training set. See [Dataset and Federation Protocol](dataset-and-federation.md).

The split is not "patient-level" unless real patient IDs exist and were used. If only the image folder exists, describe the evaluation as image/source-group-level according to what the audit proves. The same public dataset assigned to three simulated clients demonstrates aggregation mechanics; it does not establish independent institutional data silos.

## Roles and authorization

Roles:
- **admin**: create/start/cancel experiments; audit dataset; view all clients, rounds, versions and audit events.
- **hospital**: view its assigned client summary, its own local training metrics, current global version and participation status. Cannot choose its client ID or access another client's shard/metrics.

The server must authorize every endpoint and query by role and client ID. Frontend route guards are only presentation, not security. Public registration must not let users choose a role; seed one admin and three hospital accounts using a secure CLI/environment configuration. Remove mock-user fallbacks and in-memory production fallback behavior.

## Persistence and artifact lifecycle

MongoDB collections/repositories:
- users
- hospital_clients
- dataset_manifests (metadata/hash only; not necessarily raw paths)
- experiments
- training_rounds
- client_round_metrics
- model_versions
- audit_events

Checkpoint files are saved atomically under a configurable private artifact root, never in a public static directory. Each model version stores the checkpoint hash, experiment/run ID, round, architecture, initialization, explicit class mapping, preprocessing version, dataset/split hash, seed, metrics, timestamp and library versions. Keep old versions immutable. Incomplete/invalid checkpoints cannot be active.

A worker status must be persisted across restart; a running flag must not remain forever after a crashed worker. Avoid relying on process-local dictionaries as the source of experiment history.

## Frontend design

Use the muted project palette:
- #99CDD8 pale blue
- #DAEBE3 mint
- #FDE8D3 warm cream
- #F5C3B2 muted coral
- #CFD6C4 sage
- #657166 muted forest gray

Prefer a light, calm scientific dashboard, readable typography, restrained color, clear spacing, accessible contrast/focus states and responsive tables/charts. Avoid generic neon/black AI styling.

Admin routes/pages:
- Overview: run status/counts, global version, actual validation trends, client readiness/participation.
- Experiments: list, filters, configuration and states.
- Create experiment: split/model/optimizer/round/client settings; show audit warnings and held-out test rules.
- Experiment detail: round timeline, local metrics, aggregation, global validation, failures and checkpoint hashes.
- Dataset audit: class distributions, duplicate/corrupt exclusions, split and client counts, data provenance warnings.
- Model registry: immutable versions and actual metrics.

Hospital routes/pages:
- Workspace with fixed client identity and local data counts.
- Round participation, local training metrics, assigned global version and run history.

Remove obsolete patient/doctor/individual prediction workflows from primary navigation. Remove all print/export controls and related implementation, including supporting API, imports, tests and CSS. Remove Gemini API key handling and any unnecessary Gemini UI/code from the frontend.

## Security and scientific limitations

- No API secrets in browser code, localStorage or Vite-exposed environment variables.
- Fail clearly if required model checkpoints or environment secrets are unavailable; never fall back to random model weights while claiming the model is loaded.
- Use strict production configuration, CORS allowlist, strong JWT secret, password hashes and scoped authorization.
- Model updates can leak information. The current simulation does not provide secure aggregation, differential privacy, formal privacy guarantees or real network isolation.
- Never present dataset folder labels or model output as a confirmed diagnosis. Dashboard values must be derived from persisted real runs; no fabricated metrics.
