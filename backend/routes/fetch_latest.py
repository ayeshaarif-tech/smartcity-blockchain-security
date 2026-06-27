# routes/fetch_latest.py

import json
import subprocess
import os
from fastapi import APIRouter
from services.decryption import decrypt_data

router = APIRouter()

@router.get("/fetch_latest")
def fetch_and_decrypt_latest_data():
    try:
        # Load latest IPFS hashes
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ipfs_log_path = os.path.join(current_dir, "..", "encrypted_data", "ipfs_hash_log.json")
        ipfs_log_path = os.path.abspath(ipfs_log_path)

        with open(ipfs_log_path, "r") as f:
            log = json.load(f)
            last_entries = log[-10:]  # Last 10 entries (or less if not enough)

        decrypted_entries = []

        for entry in reversed(last_entries):  # Newest first
            ipfs_hash = entry["ipfs_hash"]

            # Fetch encrypted data from IPFS
            ipfs_output = subprocess.run(["ipfs", "cat", ipfs_hash], capture_output=True, text=True)

            if ipfs_output.returncode != 0:
                continue  # Skip if failed to fetch

            encrypted_payload = json.loads(ipfs_output.stdout)

            # Decrypt the data
            decrypted_data = decrypt_data(encrypted_payload)

            # Append timestamp + data
            decrypted_entries.append({
                "timestamp": entry["timestamp"],
                "data": json.loads(decrypted_data)  # Convert JSON string to dict
            })

        return {"decrypted_data_list": decrypted_entries}

    except Exception as e:
        return {"error": str(e)}
