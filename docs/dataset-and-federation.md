# Dataset and Federated Experiment Protocol

## 1. Selected working dataset

Use the existing local four-class image-folder dataset the user showed in Windows File Explorer under a folder named oasis-1 augmented. The displayed folders are:

| Display folder | Canonical model label |
|---|---|
| Non Demented | NonDemented |
| Very mild Dementia | VeryMildDemented |
| Mild Dementia | MildDemented |
| Moderate Dementia | ModerateDemented |

This is a provisional folder-to-label mapping for the existing dataset. Preserve original folder names in the audit. Do not assume the folder is the official raw OASIS-1 release solely because of its local name. Record provenance and uncertainty. The app must describe this as an educational classification experiment, not a clinically validated model.

Configure the dataset root locally with a setting such as NEUROLENS_DATASET_ROOT. Do not hardcode the user's exact machine path. Do not commit dataset images, copied/derived data, private manifests, caches, checkpoints or credentials.

## 2. Audit before splitting

The audit command must report:
- Images per source folder and canonical class.
- File count, supported extensions, unreadable/corrupt items and exclusions.
- Exact SHA-256 duplicates and possible source-image/augmentation relationships from filenames or metadata.
- Image dimensions/modes and class imbalance.
- Whether source/augmentation lineage can be determined.
- A local report and manifest with relative path, canonical label, hash, group ID if known, split, client ID and exclusion reason.

Do not infer a patient identity from a filename unless dataset documentation defines that ID. If no subject IDs exist, never claim patient-level separation.

## 3. Correct split order

Correct order is: audit/deduplicate/group → global train/validation/test split → three client partitions from training only.

1. If source/augmentation groups can be identified, treat each original and every transformation of it as one indivisible group.
2. Split groups per class, targeting 70% train / 15% validation / 15% test, stratified by class where feasible, with seed 42 by default. Keep rounding decisions deterministic.
3. Prefer genuine, unaugmented originals for validation/test. Existing augmented variants belong only in training; online augmentation may be applied only after splitting.
4. If augmentation lineage cannot be inferred, deduplicate exact byte-identical files, report that near-duplicate leakage cannot be ruled out, and do not claim source- or patient-independent evaluation. Stop with a clear warning if the audit reveals augmentation families that cannot safely be grouped.
5. Keep validation and test server-side as held-out data. No validation/test path or index may appear in any client training shard.
6. Partition training groups into exactly three disjoint shards.
7. Save a local manifest with relative path/file ID, SHA-256, canonical label, source-group ID if known, split, client ID for train items, and exclusion reason. Also save seed, split algorithm/version, class counts, dataset hash and configuration.

## 4. Three simulated hospital partitions

### Baseline: balanced class-stratified partition

For each class, shuffle its training source groups deterministically and distribute them as evenly as possible across three clients. Keep source groups indivisible. This is the easiest-to-debug initial simulation and makes all client class counts easy to inspect.

Stable client IDs:
- hospital_1 — friendly display name Hospital Alpha.
- hospital_2 — friendly display name Hospital Beta.
- hospital_3 — friendly display name Hospital Gamma.

These are simulated clients on one machine, not real hospitals. A single public dataset divided into client shards demonstrates the mechanics of federated aggregation, not inter-hospital data collection.

### Optional follow-up: non-IID clients

After the balanced baseline is proven, add a configurable Dirichlet class-distribution partition, starting with alpha 0.5. Partition source groups, not augmented files. Record alpha, seed, classes per client, sample count and algorithm version. Add guards against empty/unusably small partitions and return a clear error if a valid partition cannot be produced. Run balanced and non-IID settings as separate named experiments.

## 5. Round behaviour

Each client reads only its own training shard and starts a round from the same global checkpoint version. It performs local PyTorch training, then sends compatible model parameters and approved scalar metrics to the coordinator. The coordinator applies sample-count-weighted FedAvg, saves a versioned checkpoint, evaluates that global checkpoint on central validation data, and persists the round and its events.

A raw image or raw dataset path must not be sent through client metrics endpoints. In simulation, local storage is still shared by the same machine owner; this is a code-level simulation of data silos, not a real security boundary.

Default round failure policy: if any client fails, abort aggregation for the round and record the error. A future partial aggregation policy must be explicit in experiment configuration and visible in the UI. Never report a failed client as participating successfully.

## 6. Model, metrics and comparisons

Use the same model factory, preprocessing and explicit class mapping across all clients. A ResNet18 2D image classifier is the recommended first baseline. Generic ImageNet initialization may be compared with random initialization; do not reuse an Alzheimer-specific checkpoint without verified compatible provenance and preprocessing.

Compute actual metrics:
- Loss.
- Accuracy and balanced accuracy.
- Macro-F1 and per-class precision/recall/F1.
- Confusion matrix and per-class support.
- Local training metrics, central validation metrics and final test metrics labelled separately.

At minimum compare:
1. Centralized baseline trained on the union of exactly the same training shards.
2. FedAvg with balanced client shards.
3. Optional FedAvg with non-IID client shards.

Use the same held-out validation/test set for fair comparison. Use validation results for checkpoint/config selection. Evaluate the selected final model on the test set only after decisions are complete. Do not hardcode or fabricate graphs/metrics.

If this image-folder dataset lacks actual patient identifiers, explicitly state that the experiment cannot establish patient-level generalization. If source groups cannot be inferred, explicitly state the remaining leakage risk.

## 7. Local artifacts

Suggested ignored local workspace:
- audits/<dataset-hash>/
- manifests/<run-id>/split_manifest.csv
- runs/<run-id>/config.json
- runs/<run-id>/rounds/
- models/<model-version>/model.pt

Keep all data and derived artifacts outside public static directories and source control. Unit tests must use tiny synthetic fixtures and must not require the full dataset download.

## 8. Safety and transparency

This experiment is not evidence of clinical utility. The UI must say “classification experiment” and “simulated hospitals,” not claim diagnosis or deployment by actual hospitals. Folder labels are dataset labels. Model updates can leak information; this project has no secure aggregation or differential privacy by default.
