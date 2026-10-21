# NeuroLens Model and Evaluation Protocol

## Current model status

The existing app has a DenseNet121 implementation and old documentation reporting an approximately 99.04% result on a prior augmented four-class dataset. This figure is historical and is not verified performance on the dataset currently selected for the redesign. Do not use it in active UI as a current result and do not claim clinical validation.

The active local folder dataset shown by the user contains four class directories:
- Non Demented
- Very mild Dementia
- Mild Dementia
- Moderate Dementia

Provisional canonical class mapping (persist the exact order in every run):
```text
0 = NonDemented
1 = VeryMildDemented
2 = MildDemented
3 = ModerateDemented
```

Verify directory mapping from audit and configuration. Do not silently reassign labels through filesystem order.

## Baseline architecture

Use ResNet18 as the initial 2D image-classification baseline to keep local client training manageable and reproducible. Make generic ImageNet initialization configurable; compare with random initialization only as a separate experiment. Do not reuse an Alzheimer's-specific checkpoint unless training provenance, model architecture/keys, class mapping and preprocessing are fully verified as compatible with this dataset.

All clients must use the same factory, architecture, class order, input normalization and initial global parameters in a given experiment. Use one global state per round as the starting point for participating clients.

## Input processing

- Decode images with validation and deterministic error handling.
- Convert to RGB.
- Resize/crop to the configured target dimensions, initially 224x224.
- Convert to tensor and apply a documented normalization pipeline.
- Apply stochastic augmentations only to training examples after train/validation/test separation.
- Do not apply training augmentations to validation/test examples.
- Version the preprocessing configuration and persist it with each run/checkpoint.

If the actual folders contain files requiring another decoder or format, add the minimal required dependency after confirming via audit.

## Dataset splitting and leakage risk

Audit and deduplicate before splitting. Where filenames or metadata reveal generated variants, assign all variants of one source image to one source group. Split source groups per class, aiming for 70% train, 15% validation and 15% test with seed 42, then distribute only training groups across the three simulated clients. Prefer original examples for validation/test. Exact duplicates cannot cross any split.

If the source relationship cannot be proven, explicitly document that performance may be affected by source/augmentation leakage. Do not call image-folder split patient-level without verified patient IDs. Use the same held-out validation/test split for centralized and federated comparisons.

## Training and federation

Use PyTorch. Integrate Flower/FedAvg with compatible pinned versions if practical. Every client starts from the identical current global checkpoint for its round and trains only on its local training shard. The coordinator computes sample-count-weighted FedAvg from the actual client parameters and records participation, training examples, local loss/metrics, duration, global validation metrics and resulting checkpoint version.

Handle non-floating model state such as integer BatchNorm buffers safely. Do not naïvely average integer counters. On any client error, default to aborting that round and persisting the failure. Save global checkpoints atomically and never overwrite immutable history. Missing/corrupt checkpoint errors must not fall back to silently initialized random weights.

## Evaluation

Evaluate actual model predictions and record:
- Cross-entropy or configured evaluation loss.
- Accuracy and balanced accuracy.
- Macro-F1 and per-class precision/recall/F1.
- Confusion matrix and support per class.
- Per-client training metrics, central validation metrics and final test metrics as separate fields/scopes.

Use validation metrics for checkpoint/config selection. Run the held-out test evaluation only after model selection. Do not present training accuracy as generalization performance. For class imbalance, show class support and macro metrics with accuracy.

Compare at minimum:
1. Centralized baseline trained on the union of client train shards.
2. FedAvg over balanced three-client partitions.
3. Optional non-IID client partition experiment after the baseline is stable.

Use the same model architecture, split, label mapping and comparable training budget for a meaningful comparison. Report seeds and settings alongside results.

## Checkpoint manifest

Each version should include:
`model_version_id, experiment_id, round, architecture, initialization, num_classes, class_mapping, preprocessing_version, dataset_manifest_hash, split_config, seed, library_versions, metrics, created_at, checkpoint_sha256, artifact_locator`.

Never save raw MRI files or secret config inside a checkpoint metadata document. The artifact must live in private configured storage and only be exposed via authorized application flows.

## Limitations

A single-machine simulated federation does not prove hospital-to-hospital generalization. This design does not include secure aggregation or differential privacy, and model updates may leak information. The image-folder dataset may be augmented and may not contain reliable patient/source identities. The UI and README must state those limits. This is an educational research experiment, not a clinical decision or diagnosis.
