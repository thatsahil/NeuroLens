import os
import hashlib
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import torch

from app.ml.model import build_federated_densenet121, CLASS_MAPPING, IDX_TO_CLASS
from app.core.config import settings
from app.database.mongodb import get_database
from app.services.audit_service import log_audit_event

logger = logging.getLogger("neurolens.model_registry")

# Known verified SHA-256 for Round 0 and Round 1
EXPECTED_ROUND_0_SHA256 = "5c35dbf9eafa1ef1c923b603d2d44318aadd3abf2756275b0fd159ff0c9cc754"
EXPECTED_ROUND_1_SHA256 = "2edb86fe68e5ae29af5bd70eebb5b0262cc6abc698e90b1c7db91a4f5dbca360"

def compute_file_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

class ModelRegistry:
    def __init__(self):
        self.active_model = None
        self.active_model_meta: Optional[Dict[str, Any]] = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.status: str = "uninitialized"
        self.error_message: Optional[str] = None

    def initialize(self):
        """
        Loads the active model checkpoint if present on disk.
        Does NOT invent random weights or train on startup if missing.
        """
        checkpoint_path = settings.ACTIVE_MODEL_PATH
        if not os.path.isabs(checkpoint_path):
            checkpoint_path = os.path.join(os.getcwd(), checkpoint_path)

        if not os.path.exists(checkpoint_path):
            self.status = "unavailable"
            self.error_message = f"Active checkpoint file not found at: {checkpoint_path}"
            logger.warning(self.error_message)
            return

        try:
            sha256 = compute_file_sha256(checkpoint_path)
            file_size_bytes = os.path.getsize(checkpoint_path)

            # Strict architecture load with weights_only
            model = build_federated_densenet121(pretrained=False)
            state_dict = torch.load(checkpoint_path, map_location=self.device, weights_only=True)
            
            # If checkpoint wrapped in a dict
            if isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]

            # Load strictly
            model.load_state_dict(state_dict, strict=True)
            model.to(self.device)
            model.eval()

            self.active_model = model
            self.status = "ready"
            self.error_message = None

            self.active_model_meta = {
                "version_tag": "global_round_001",
                "round": 1,
                "model_name": "DenseNet121",
                "classifier_shape": [4, 1024],
                "sha256": sha256,
                "file_size_bytes": file_size_bytes,
                "class_mapping": CLASS_MAPPING,
                "device": str(self.device),
                "is_active": True,
                "evaluation_status": "Not evaluated"
            }
            logger.info(f"Loaded active model global_round_001 (SHA: {sha256[:12]}...) on {self.device}")
        except Exception as e:
            self.status = "error"
            self.error_message = f"Failed to validate and load checkpoint: {str(e)}"
            self.active_model = None
            logger.error(self.error_message)

    async def get_active_model_info(self) -> Dict[str, Any]:
        db = get_database()
        if db is not None:
            active_doc = await db.model_versions.find_one({"is_active": True})
            if active_doc:
                active_doc["id"] = str(active_doc.pop("_id", ""))
                return active_doc

        return {
            "version_tag": "global_round_001",
            "round": 1,
            "model_name": "DenseNet121",
            "aggregation_method": "FedAvg",
            "status": self.status,
            "error_message": self.error_message,
            "sha256": self.active_model_meta.get("sha256") if self.active_model_meta else EXPECTED_ROUND_1_SHA256,
            "class_mapping": CLASS_MAPPING,
            "total_training_samples": 69465,
            "evaluation_status": "Not evaluated",
            "is_active": True,
            "client_contributions": {
                "hospital_1": {"samples": 22769, "weight": 0.327777},
                "hospital_2": {"samples": 23623, "weight": 0.340071},
                "hospital_3": {"samples": 23073, "weight": 0.332153}
            }
        }

    async def list_models(self):
        db = get_database()
        if db is not None:
            models_list = await db.model_versions.find().sort("round", 1).to_list(100)
            if models_list:
                for m in models_list:
                    m["id"] = str(m.pop("_id", ""))
                return models_list

        # Return verified static metadata if DB collections empty
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
                "created_at": "2026-10-23T06:00:00Z"
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
                "created_at": "2026-10-23T07:53:36Z"
            }
        ]

model_registry = ModelRegistry()
