import json
import subprocess
import os
import numpy as np
import joblib
import tensorflow as tf
from fastapi import APIRouter
from collections import deque

import sys
import importlib.util

# 🧩 Dynamically import decryption
module_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "decryption.py"))
spec = importlib.util.spec_from_file_location("decryption", module_path)
decryption_module = importlib.util.module_from_spec(spec)
sys.modules["services.decryption"] = decryption_module
spec.loader.exec_module(decryption_module)
from services.decryption import decrypt_data

router = APIRouter()

# ✅ Load model and scaler
model_path = os.path.join(os.path.dirname(__file__), "..", "ML", "lstm_model.keras")
scaler_path = os.path.join(os.path.dirname(__file__), "..", "ML", "linear_model.pkl")

best_model = tf.keras.models.load_model(model_path)
scaler = joblib.load(scaler_path)

# 🌀 Window size used during training
WINDOW_SIZE = 24

@router.get("/predict_latest")
def fetch_decrypt_and_predict():
    try:
        # 📂 Load last 24 readings
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ipfs_log_path = os.path.abspath(os.path.join(current_dir, "..", "encrypted_data", "ipfs_hash_log.json"))

        with open(ipfs_log_path, "r") as f:
            log = json.load(f)
            last_entries = log[-WINDOW_SIZE:]

        if len(last_entries) < WINDOW_SIZE:
            return {"error": f"Not enough data for prediction. Need {WINDOW_SIZE} readings."}

        sequence = []
        decrypted_entries = []

        for entry in reversed(last_entries):  # Newest first
            ipfs_hash = entry["ipfs_hash"]

            result = subprocess.run(["ipfs", "cat", ipfs_hash], capture_output=True, text=True)

            if result.returncode != 0:
                continue

            encrypted_payload = json.loads(result.stdout)
            decrypted = decrypt_data(encrypted_payload)
            data_json = json.loads(decrypted)

            # ✅ Expecting only mq135_ppm
            air_quality_value = float(data_json.get("air_quality", 0))
            sequence.append([air_quality_value])  # Must be 2D for scaler

            decrypted_entries.append({
                "timestamp": entry["timestamp"],
                "data": data_json
            })

        # 🔄 Reverse to maintain chronological order
        sequence = list(reversed(sequence))  # oldest to newest
        scaled_sequence = scaler.transform(sequence)

        # 🧠 Reshape for LSTM: (1, 24, 1)
        input_sequence = np.array(scaled_sequence).reshape((1, WINDOW_SIZE, 1))

        # 🔮 Predict
        prediction_scaled = best_model.predict(input_sequence)
        prediction_original = scaler.inverse_transform([[prediction_scaled[0][0]]])[0][0]

        return {
            "decrypted_data_list": decrypted_entries,
            "latest_prediction": float(prediction_original)
        }

    except Exception as e:
        return {"error": str(e)}
