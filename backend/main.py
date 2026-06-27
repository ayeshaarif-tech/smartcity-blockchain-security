import json
import os
import datetime
from fastapi import FastAPI, HTTPException
import subprocess
app = FastAPI()
from routes import fetch_latest, predict_latest
app.include_router(fetch_latest.router)
app.include_router(predict_latest.router)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend IP for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define storage folder
STORAGE_FOLDER = "encrypted_data"
os.makedirs(STORAGE_FOLDER, exist_ok=True)

# File for storing IPFS hashes
IPFS_HASH_LOG = os.path.join(STORAGE_FOLDER, "ipfs_hash_log.json")

@app.post("/upload")
async def receive_data(payload: dict):
    try:
        encrypted_data = payload["encrypted_data"]

        # Generate a readable timestamp
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Readable format
        file_safe_timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")  # For filenames

        file_name = f"encrypted_data_{file_safe_timestamp}.json"
        file_path = os.path.join(STORAGE_FOLDER, file_name)

        # Save encrypted data with a unique filename
        with open(file_path, "w") as file:
            json.dump(encrypted_data, file)

        print(f"[INFO] Encrypted data received and saved: {file_name}")

        # Upload to IPFS
        ipfs_add_output = subprocess.run(["ipfs", "add", file_path], capture_output=True, text=True)

        if ipfs_add_output.returncode != 0:
            raise Exception("IPFS upload failed: " + ipfs_add_output.stderr)

        ipfs_hash = ipfs_add_output.stdout.split()[1]

        # Append new hash to IPFS log file
        log_entry = {"timestamp": timestamp, "ipfs_hash": ipfs_hash}
        
        if os.path.exists(IPFS_HASH_LOG):
            with open(IPFS_HASH_LOG, "r") as hash_file:
                hash_data = json.load(hash_file)
        else:
            hash_data = []

        hash_data.append(log_entry)

        with open(IPFS_HASH_LOG, "w") as hash_file:
            json.dump(hash_data, hash_file, indent=4)

        print(f"[INFO] Data uploaded to IPFS successfully! IPFS Hash: {ipfs_hash}")

        return {"message": "File stored in IPFS", "timestamp": timestamp, "ipfs_hash": ipfs_hash}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
