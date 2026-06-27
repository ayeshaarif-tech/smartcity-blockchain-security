from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from collections import deque
import uvicorn

# 🛡️ FastAPI app
app = FastAPI()

# 🔓 Allow frontend requests (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load model and scaler
model = load_model("lstm_model.keras")
scaler = joblib.load("linear_model.pkl")

# 🌀 Sequence buffer for last 20 air_quality values
sequence_buffer = deque(maxlen=20)

# 📥 Expected input format
class SensorData(BaseModel):
    air_quality: float

@app.post("/predict")
async def predict(data: SensorData):
    try:
        print("📨 Received:", data.air_quality)

        # Step 1: Convert to 2D array
        input_array = np.array([[data.air_quality]])

        # Step 2: Scale input
        scaled = scaler.transform(input_array)

        # Step 3: Append to buffer
        sequence_buffer.append(scaled[0][0])  # Single value

        # Step 4: Wait for buffer to fill
        if len(sequence_buffer) < 20:
            return {"prediction": "Waiting for 20 readings."}

        # Step 5: Prepare input shape (1, 20, 1)
        sequence = np.array(sequence_buffer).reshape(1, 20, 1)

        # Step 6: Predict
        prediction_scaled = model.predict(sequence)
        prediction_original = scaler.inverse_transform([[prediction_scaled[0][0]]])[0][0]

        print("✅ Prediction:", prediction_original)
        return {"prediction": float(prediction_original)}

    except Exception as e:
        print("❌ Error:", str(e))
        return {"error": str(e)}

# 🏁 Run with: python lstm_backend.py
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
