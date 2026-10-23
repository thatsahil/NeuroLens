import uuid
from datetime import datetime
from pymongo import MongoClient
import os
import sys

# Append backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.config import settings
from app.core.security import get_password_hash

SEEDED_ACCOUNTS = [
    {
        "name": "NeuroLens Administrator",
        "email": "admin@neurolens.org",
        "default_password": "AdminSecurePassword2026!",
        "role": "admin",
        "client_id": None
    },
    {
        "name": "Hospital Alpha Workspace",
        "email": "hospital1@neurolens.org",
        "default_password": "Hospital1Password2026!",
        "role": "hospital",
        "client_id": "hospital_1"
    },
    {
        "name": "Hospital Beta Workspace",
        "email": "hospital2@neurolens.org",
        "default_password": "Hospital2Password2026!",
        "role": "hospital",
        "client_id": "hospital_2"
    },
    {
        "name": "Hospital Gamma Workspace",
        "email": "hospital3@neurolens.org",
        "default_password": "Hospital3Password2026!",
        "role": "hospital",
        "client_id": "hospital_3"
    }
]

HOSPITAL_CLIENT_METADATA = [
    {
        "_id": "hospital_1",
        "display_name": "Hospital Alpha",
        "sample_count": 22769,
        "fedavg_weight": 0.32777657813287264,
        "round_1_checkpoint_hash": "dab0c84e8e53be0ae5212a814fff65a91dd8feaba76d58b1f787234313507e6a",
        "status": "ready",
        "last_active": datetime.utcnow()
    },
    {
        "_id": "hospital_2",
        "display_name": "Hospital Beta",
        "sample_count": 23623,
        "fedavg_weight": 0.34007053912042035,
        "round_1_checkpoint_hash": "ddd00b295c1bd6f565a560296db4f8edf83021bf760c61860d457a1ceafd5188",
        "status": "ready",
        "last_active": datetime.utcnow()
    },
    {
        "_id": "hospital_3",
        "display_name": "Hospital Gamma",
        "sample_count": 23073,
        "fedavg_weight": 0.33215288274670696,
        "round_1_checkpoint_hash": "eb63619ecafa1a7a33cafa7cad08f30180eff8c3634ca058d7f5101ce9a07be6",
        "status": "ready",
        "last_active": datetime.utcnow()
    }
]

def seed_database():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client[settings.DATABASE_NAME]

    # Create Indexes
    db.users.create_index("email", unique=True)
    db.model_versions.create_index("version_tag", unique=True)
    db.audit_events.create_index("timestamp")

    print("\n--- Seeding Fixed Accounts ---")
    for acc in SEEDED_ACCOUNTS:
        existing = db.users.find_one({"email": acc["email"]})
        if existing:
            print(f"Account exists: {acc['email']} ({acc['role']})")
        else:
            doc = {
                "_id": str(uuid.uuid4()),
                "name": acc["name"],
                "email": acc["email"],
                "password_hash": get_password_hash(acc["default_password"]),
                "role": acc["role"],
                "client_id": acc["client_id"],
                "disabled": False,
                "created_at": datetime.utcnow()
            }
            db.users.insert_one(doc)
            print(f"Created account: {acc['email']} (role: {acc['role']}, client_id: {acc['client_id']})")

    print("\n--- Seeding Hospital Client Entities ---")
    for client_doc in HOSPITAL_CLIENT_METADATA:
        db.hospital_clients.update_one(
            {"_id": client_doc["_id"]},
            {"$set": client_doc},
            upsert=True
        )
        print(f"Updated hospital client entity: {client_doc['_id']} ({client_doc['display_name']})")

    # Record Audit
    db.audit_events.insert_one({
        "_id": str(uuid.uuid4()),
        "action": "system_database_seeded",
        "user_id": "system",
        "role": "system",
        "client_id": None,
        "details": {"accounts_count": len(SEEDED_ACCOUNTS), "clients_count": len(HOSPITAL_CLIENT_METADATA)},
        "status": "success",
        "timestamp": datetime.utcnow()
    })

    print("\nDatabase seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
