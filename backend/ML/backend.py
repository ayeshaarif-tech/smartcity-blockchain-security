from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from collections import deque

# 🛡️ FastAPI app
app = FastAPI()

# 🔓 Allow React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load LSTM model and scaler
lstm_model = load_model("lstm_model.keras")  # Or .h5 if you used that
scaler = joblib.load("../linear_model.pkl")  # ✅ Correct
 # Make sure you saved this during training
print("✅ Scaler Loaded")
# 🧠 Sequence buffer to store last 20 inputs (deque holds 20 steps)
sequence_buffer = deque(maxlen=20)

# 📥 Expected input format from frontend
class SensorData(BaseModel):
    air_quality: float

@app.post('/predict')
async def predict(data: SensorData):
    try:
        print("📨 Received:", data)

        # ➕ Convert to numpy
        current_input = np.array([[data.air_quality]])

        # 🌀 Scale the input (same way as training)
        current_scaled = scaler.transform(current_input)

        # ➕ Add to the buffer
        sequence_buffer.append(current_scaled[0])

        # ⚠️ Wait until we have 20 readings
        if len(sequence_buffer) < 20:
            return {"prediction": "Waiting for more data (need 20 readings)."}

        # 📐 Convert buffer to (1, 20, 5)
        lstm_input = np.array(sequence_buffer).reshape(1, 20, 5)

        # 🧠 Predict using LSTM
        predicted_scaled = lstm_model.predict(lstm_input)
        predicted_original = scaler.inverse_transform(
            np.hstack([predicted_scaled, np.zeros((1, 4))])  # Pad back to 5 features
        )[0, 0]  # Only the first column (air quality)

        print("✅ Prediction:", predicted_original)
        return {"prediction": float(predicted_original)}

    except Exception as e:
        print("❌ Prediction Error:", str(e))
        return {"error": str(e)}

# 🏁 Run server
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
