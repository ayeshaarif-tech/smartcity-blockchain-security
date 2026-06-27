import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Alerts.css";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thresholds for generating alerts
  const thresholds = {
    wasteManagement: 50, // IR distance threshold
    temperature: 40,     // Temperature threshold (°C)
    humidity: 70,        // Humidity threshold (%)
    vibration: 5,        // Vibration threshold (arbitrary units)
    airQuality: 150,     // Air Quality threshold (PPM)
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/fetch_latest");
        const result = response.data;

        if (result.error) {
          console.error("Backend Error:", result.error);
          return;
        }

        const decryptedDataList = result.decrypted_data_list.map((entry) => ({
          ...entry.data,
          Time: entry.timestamp,
        }));

        const generatedAlerts = [];

        decryptedDataList.forEach((row) => {
          const { Time, IRDistance, Temperature, Humidity, Vibration, PPM } = row;

          if (IRDistance > thresholds.wasteManagement) {
            generatedAlerts.push(`Alert at ${Time}: Waste level (${IRDistance}) exceeds ${thresholds.wasteManagement}.`);
          }
          if (Temperature > thresholds.temperature) {
            generatedAlerts.push(`Alert at ${Time}: Temperature (${Temperature}°C) exceeds ${thresholds.temperature}°C.`);
          }
          if (Humidity > thresholds.humidity) {
            generatedAlerts.push(`Alert at ${Time}: Humidity (${Humidity}%) exceeds ${thresholds.humidity}%.`);
          }
          if (Vibration > thresholds.vibration) {
            generatedAlerts.push(`Alert at ${Time}: Vibration (${Vibration}) exceeds ${thresholds.vibration}.`);
          }
          if (PPM > thresholds.airQuality) {
            generatedAlerts.push(`Alert at ${Time}: Air Quality (${PPM} PPM) exceeds ${thresholds.airQuality}.`);
          }
        });

        setAlerts(generatedAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="alerts-container">
      <h1>Sensor Alerts</h1>

      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length > 0 ? (
        <ul className="alerts-list">
          {alerts.map((alert, index) => (
            <li key={index} className="alert-item">
              {alert}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-alerts">No alerts. All sensor values are within safe thresholds.</p>
      )}
    </div>
  );
};

export default Alerts;
