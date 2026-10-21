# NeuroLens API Contract

Base prefix: `/api/v1`. This is the target contract for the federated redesign. Implement endpoints with Pydantic request/response schemas and align the frontend service layer to the actual responses. All experiment metrics must come from persisted runs, not UI fixtures.

## Authentication

### `POST /auth/login`
Authenticate an existing seeded account. Request: email/password. Response: bearer token and public user object containing ID, name, email, role and assigned hospital client ID when role is hospital.

### `GET /auth/me`
Return the current authenticated user. A missing/deleted user subject is unauthorized; never fabricate a mock user.

Public role self-registration is disabled by default. Seed admin and three hospital accounts using a backend CLI/interactive environment flow.

## Health

### `GET /health`
Return service status, API version, database connectivity and training-worker status. Report model status only when a relevant checkpoint is actually loaded and validated. Do not return healthy when required systems are unavailable.

## Dataset audit (admin only)

### `GET /datasets/audit`
Return the latest stored audit summary, if available, including dataset hash, per-class counts, supported/invalid file counts, exact duplicates, source-grouping warnings and generated timestamp. Do not return absolute paths or a per-image manifest to clients.

### `POST /datasets/audit`
Audit the backend-configured local dataset root. Do not accept arbitrary filesystem paths from the browser. Persist an audit summary and manifest metadata/hash; local manifests remain in the private workspace.

Potential response shape:
```json
{
  "dataset_id": "dataset_audit_id",
  "status": "completed",
  "dataset_hash": "sha256...",
  "class_counts": {
    "NonDemented": 0,
    "VeryMildDemented": 0,
    "MildDemented": 0,
    "ModerateDemented": 0
  },
  "valid_files": 0,
  "excluded_files": 0,
  "exact_duplicate_files": 0,
  "source_grouping_status": "verified|partial|unknown",
  "warnings": []
}
```
Counts above are schema examples, not real dataset statistics.

## Admin overview and simulated hospitals

- `GET /admin/overview` — admin only; aggregate persisted run/client/global-model information.
- `GET /admin/hospitals` — admin only; three seeded simulated clients, readiness, sample/class counts derived from audit and latest participation. Do not expose raw image paths.

## Experiments

### `POST /experiments` (admin only)
Create a queued experiment. Request includes: dataset audit ID, split strategy/version, seed, model architecture and initialization, preprocessing version, FL strategy (FedAvg), number of rounds, local epochs, batch size, learning rate, client partition strategy and non-IID alpha when used. Validate that audit/split artifacts exist. Never accept arbitrary checkpoint filesystem paths from the browser.

### `GET /experiments`
Return paginated experiments. Admin may view all; hospital user receives only experiments/participation that include its assigned client, with fields scoped to that client where necessary.

### `GET /experiments/{experiment_id}`
Role-authorized experiment detail: status, config, progress, global version, timestamps, warnings and real metric summary.

### `GET /experiments/{experiment_id}/rounds`
Paginated timeline. Admin sees each client’s status and local metrics; hospital sees only its own client record plus permitted global-round status.

### `POST /experiments/{experiment_id}/start` (admin only)
Queue/start a durable background job and return immediately with an accepted status. Must not block until all training rounds complete.

### `POST /experiments/{experiment_id}/cancel` (admin only)
Request cooperative cancellation. Persist cancellation state; stop at the next safe boundary, normally between rounds.

Experiment states: `queued`, `running`, `cancelling`, `cancelled`, `completed`, `failed`. A worker crash must be reconciled after restart.

Round states: `pending`, `running`, `completed`, `failed`, `aborted`. Failed client participation is visible. Default policy is to abort aggregation if any client fails.

## Hospital workspace

- `GET /hospitals/me/workspace` — hospital role only; return assigned fixed client ID, local class/sample summary, current global model version, latest round participation and own local metrics.
- `GET /hospitals/me/rounds` — hospital role only; only records for the authenticated user's assigned client. Never accept client ID from request to override the authenticated mapping.

## Model registry

- `GET /models` — list permitted metadata for immutable model versions.
- `GET /models/{model_version_id}` — authorized version metadata and metrics.
- Any activation/default-selection action is admin only.
- Do not expose model files through an unauthenticated public static path.

## Persistence shapes (conceptual)

Experiment:
`id, status, config, dataset_id, split_manifest_hash, created_by, created_at, started_at, completed_at, current_round, selected_model_version_id, warnings, error_summary`

Round:
`id, experiment_id, round_index, status, base_model_version_id, resulting_model_version_id, participants, started_at, completed_at, global_validation_metrics, aggregation_summary, failure_summary`

Client-round metric:
`id, experiment_id, round_index, client_id, status, train_examples, train_class_counts, train_loss, train_metrics, duration_ms, error_code`

Model version:
`id, experiment_id, round_index, architecture, initialization, class_mapping, preprocessing_version, dataset_hash, split_hash, seed, metrics, checkpoint_sha256, artifact_locator, created_at, active`

Audit event:
`id, actor_id, action, resource_type, resource_id, timestamp, metadata_redacted`

Do not store secrets or image pixels in metric documents. Avoid exposing local absolute paths.

## Errors and status codes

Use consistent JSON errors with stable `code` and human-readable `message`. Use appropriate 400/401/403/404/409/413/422/500/503 responses. Do not expose exception traces, environment values or raw filesystem paths. For a failed job, store a safe error summary for UI and detailed logs privately on the backend.
