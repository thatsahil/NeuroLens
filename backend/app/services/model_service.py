import os
import hashlib
import logging
from typing import Dict, Any, Optional

import torch

from app.ml.model import build_federated_densenet121, CLASS_MAPPING, NUM_CLASSES
from app.core.config import settings
from app.database.mongodb import get_database

logger = logging.getLogger("neurolens.model_registry")

EXPECTED_CENTRALIZED_SHA256 = settings.EXPECTED_CENTRALIZED_SHA256
EXPECTED_ROUND_0_SHA256 = "5c35dbf9eafa1ef1c923b603d2d44318aadd3abf2756275b0fd159ff0c9cc754"
EXPECTED_ROUND_1_SHA256 = "2edb86fe68e5ae29af5bd70eebb5b0262cc6abc698e90b1c7db91a4f5dbca360"


def compute_file_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def resolve_checkpoint_path(path_str: str) -> str:
    candidates = [
        path_str,
        os.path.join(os.getcwd(), path_str),
        os.path.join("backend", path_str),
        os.path.join("..", path_str),
    ]
    for candidate in candidates:
        if os.path.exists(candidate) and os.path.isfile(candidate):
            return os.path.abspath(candidate)
    return os.path.abspath(path_str)


def load_verified_densenet121(checkpoint_path: str, device: torch.device) -> tuple[torch.nn.Module, dict]:
    """
    Load the verified checkpoint with CPU memory mapping.
    Meta-device construction + assign=True avoids allocating a second randomly
    initialized copy of DenseNet parameters before loading the checkpoint.
    """
    resolved_path = resolve_checkpoint_path(checkpoint_path)
    if not os.path.isfile(resolved_path):
        raise FileNotFoundError(
            f"Checkpoint file not found at: {resolved_path} (original: {checkpoint_path})"
        )

    file_size_bytes = os.path.getsize(resolved_path)
    sha256 = compute_file_sha256(resolved_path)
    logger.info(
        f"Loading checkpoint from: {resolved_path} "
        f"(Size: {file_size_bytes} bytes, SHA-256: {sha256})"
    )

    # The deployed service is CPU-only. mmap keeps checkpoint storage file-backed
    # instead of eagerly copying the complete checkpoint into RAM.
    state_dict = torch.load(
        resolved_path,
        map_location="cpu",
        mmap=True,
        weights_only=True,
    )
    if isinstance(state_dict, dict) and "state_dict" in state_dict:
        state_dict = state_dict["state_dict"]

    # Create parameter placeholders without allocating initialized weights.
    with torch.device("meta"):
        model = build_federated_densenet121(pretrained=False)

    model.load_state_dict(state_dict, strict=True, assign=True)

    if model.classifier.weight.shape != (4, 1024):
        raise ValueError(
            f"Classifier weight shape mismatch: expected (4, 1024), "
            f"got {model.classifier.weight.shape}"
        )
    if model.classifier.bias.shape != (4,):
        raise ValueError(
            f"Classifier bias shape mismatch: expected (4,), "
            f"got {model.classifier.bias.shape}"
        )

    model.to(device)
    model.eval()

    meta = {
        "checkpoint_path": resolved_path,
        "file_size_bytes": file_size_bytes,
        "sha256": sha256,
        "device": str(device),
        "num_classes": NUM_CLASSES,
        "classifier_shape": [4, 1024],
        "class_mapping": CLASS_MAPPING,
    }
    return model, meta


class ModelRegistry:
    def __init__(self):
        # Limit CPU thread pools on small Render instances.
        torch.set_num_threads(1)
        self.active_model = None
        self.active_model_meta: Optional[Dict[str, Any]] = None
        self.device = torch.device("cpu")
        self.status: str = "uninitialized"
        self.error_message: Optional[str] = None

    def initialize(self):
        """Load the active, checksum-verified model once at startup."""
        checkpoint_path = settings.ACTIVE_MODEL_PATH
        try:
            model, meta = load_verified_densenet121(checkpoint_path, self.device)
            self.active_model = model
            self.status = "ready"
            self.error_message = None

            self.active_model_meta = {
                "version_tag": "centralized_densenet121_best",
                "round": 1,
                "model_name": "DenseNet121",
                "training_type": "Centralized",
                "classifier_shape": [4, 1024],
                "sha256": meta["sha256"],
                "file_size_bytes": meta["file_size_bytes"],
                "checkpoint_path": meta["checkpoint_path"],
                "class_mapping": CLASS_MAPPING,
                "device": str(self.device),
                "is_active": True,
                "best_validation_loss": 0.9691,
                "test_accuracy": 0.7105,
                "balanced_accuracy": 0.3890,
                "macro_f1": 0.3795,
                "evaluation_status": "Evaluated",
            }
            logger.info(
                f"Loaded active model centralized_densenet121_best "
                f"(SHA: {meta['sha256'][:12]}...) on {self.device}"
            )
        except Exception as e:
            self.status = "error"
            self.error_message = f"Failed to validate and load checkpoint: {str(e)}"
            self.active_model = None
            logger.exception(self.error_message)

    def get_loaded_model(self) -> torch.nn.Module:
        if self.active_model is None or self.status != "ready":
            self.initialize()
        if self.active_model is None or self.status != "ready":
            raise RuntimeError(
                f"Model is unavailable. Status: {self.status}. Reason: {self.error_message}"
            )
        return self.active_model

    async def get_active_model_info(self) -> Dict[str, Any]:
        if self.active_model_meta:
            return self.active_model_meta

        db = get_database()
        if db is not None:
            active_doc = await db.model_versions.find_one({"is_active": True})
            if active_doc:
                active_doc["id"] = str(active_doc.pop("_id", ""))
                return active_doc

        return {
            "version_tag": "centralized_densenet121_best",
            "model_name": "DenseNet121",
            "training_type": "Centralized",
            "status": self.status,
            "error_message": self.error_message,
            "sha256": (
                self.active_model_meta.get("sha256")
                if self.active_model_meta
                else EXPECTED_CENTRALIZED_SHA256
            ),
            "class_mapping": CLASS_MAPPING,
            "best_validation_loss": 0.9691,
            "test_accuracy": 0.7105,
            "balanced_accuracy": 0.3890,
            "macro_f1": 0.3795,
            "evaluation_status": "Evaluated",
            "is_active": True,
        }

    async def list_models(self):
        db = get_database()
        if db is not None:
            models_list = await db.model_versions.find().sort("round", 1).to_list(100)
            if models_list:
                for item in models_list:
                    item["id"] = str(item.pop("_id", ""))
                return models_list

        return [
            {
                "id": "model_round_000",
                "version_tag": "global_round_000",
                "round": 0,
                "model_name": "DenseNet121",
                "aggregation_method": "Initialization",
                "sha256": EXPECTED_ROUND_0_SHA256,
                "is_active": False,
                "evaluation_status": "Not evaluated",
                "created_at": "2026-10-23T06:00:00Z",
            },
            {
                "id": "model_round_001",
                "version_tag": "global_round_001",
                "round": 1,
                "model_name": "DenseNet121",
                "aggregation_method": "FedAvg",
                "parent_version": "global_round_000",
                "sha256": EXPECTED_ROUND_1_SHA256,
                "is_active": True,
                "evaluation_status": "Not evaluated",
                "sample_count": 69465,
                "created_at": "2026-10-23T07:53:36Z",
            },
        ]


model_registry = ModelRegistry()
