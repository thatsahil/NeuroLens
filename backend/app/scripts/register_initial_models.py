import os
import json
import uuid
from datetime import datetime
from pymongo import MongoClient
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.core.config import settings

def register_initial_models():
    client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client[settings.DATABASE_NAME]

    round_0_doc = {
        "_id": "model_global_round_000",
        "version_tag": "global_round_000",
        "round": 0,
        "model_name": "DenseNet121",
        "aggregation_method": "Initial Weights",
        "parent_version": None,
        "sha256": "5c35dbf9eafa1ef1c923b603d2d44318aadd3abf2756275b0fd159ff0c9cc754",
        "file_path": "artifacts/global_models/global_model_round_000.pth",
        "is_active": False,
        "evaluation_status": "Not evaluated",
        "total_training_samples": 0,
        "created_at": datetime.fromisoformat("2026-10-23T06:00:00+00:00")
    }

    round_1_doc = {
        "_id": "model_global_round_001",
        "version_tag": "global_round_001",
        "round": 1,
        "model_name": "DenseNet121",
        "aggregation_method": "FedAvg",
        "parent_version": "global_round_000",
        "parent_sha256": "5c35dbf9eafa1ef1c923b603d2d44318aadd3abf2756275b0fd159ff0c9cc754",
        "sha256": "2edb86fe68e5ae29af5bd70eebb5b0262cc6abc698e90b1c7db91a4f5dbca360",
        "file_path": "artifacts/global_models/global_model_round_001.pth",
        "is_active": True,
        "evaluation_status": "Not evaluated",
        "total_training_samples": 69465,
        "client_ids": ["hospital_1", "hospital_2", "hospital_3"],
        "sample_counts": {
            "hospital_1": 22769,
            "hospital_2": 23623,
            "hospital_3": 23073
        },
        "aggregation_weights": {
            "hospital_1": 0.32777657813287264,
            "hospital_2": 0.34007053912042035,
            "hospital_3": 0.33215288274670696
        },
        "client_checkpoint_sha256": {
            "hospital_1": "dab0c84e8e53be0ae5212a814fff65a91dd8feaba76d58b1f787234313507e6a",
            "hospital_2": "ddd00b295c1bd6f565a560296db4f8edf83021bf760c61860d457a1ceafd5188",
            "hospital_3": "eb63619ecafa1a7a33cafa7cad08f30180eff8c3634ca058d7f5101ce9a07be6"
        },
        "created_at": datetime.fromisoformat("2026-10-23T07:53:36.426688+00:00")
    }

    db.model_versions.update_one({"_id": round_0_doc["_id"]}, {"$set": round_0_doc}, upsert=True)
    db.model_versions.update_one({"_id": round_1_doc["_id"]}, {"$set": round_1_doc}, upsert=True)

    # Initial experiment record representing Round 1 execution
    exp_doc = {
        "_id": "exp_initial_federated_round_1",
        "name": "Global Federated Round 1 (FedAvg)",
        "model_name": "DenseNet121",
        "parent_model": "global_round_000",
        "current_round": 1,
        "status": "completed",
        "participating_clients": ["hospital_1", "hospital_2", "hospital_3"],
        "total_samples": 69465,
        "aggregation_method": "FedAvg",
        "created_at": datetime.fromisoformat("2026-10-23T07:00:00+00:00"),
        "completed_at": datetime.fromisoformat("2026-10-23T07:53:36+00:00")
    }
    db.experiments.update_one({"_id": exp_doc["_id"]}, {"$set": exp_doc}, upsert=True)

    print("Initial model versions and Round 1 experiment history successfully registered in MongoDB.")

if __name__ == "__main__":
    register_initial_models()
