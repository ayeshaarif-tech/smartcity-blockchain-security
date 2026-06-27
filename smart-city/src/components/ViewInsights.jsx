import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import './ViewInsights.css';
import { Chart as ChartJS } from 'chart.js/auto';

const ViewInsights = () => {
  const [sensorData, setSensorData] = useState([]);
  const [insights, setInsights] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [predictionCategory, setPredictionCategory] = useState("");
  const [predictionTime, setPredictionTime] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/predict_latest");
        const result = response.data;
        console.log("Fetched Data:", result);

        if (result.error) {
          console.error("Backend Error:", result.error);
          return;
        }

        const decryptedDataList = result.decrypted_data_list.map((entry) => ({
          temperature: entry.data.temperature,
          humidity: entry.data.humidity,
          air_quality: entry.data.air_quality ?? entry.data.mq135_pp, // handle fallback
          noise_level: entry.data.noise_level,
          waste_level: entry.data.waste_level,
          Time: entry.timestamp,
        }));

        setSensorData(decryptedDataList);

        const predictCategory = (value) => {
           if (value <= 50) return "Good";
           if (value <= 100) return "Moderate";
           if (value <= 150) return "Unhealthy for Sensitive Groups";
           if (value <= 200) return "Unhealthy";
           if (value <= 300) return "Very Unhealthy";
           return "Hazardous";
};


        const calculatedInsights = {
          avgTemperature: calculateAverage(decryptedDataList, "temperature"),
          avgHumidity: calculateAverage(decryptedDataList, "humidity"),
          avgAirQuality: calculateAverage(decryptedDataList, "air_quality"),
          maxNoiseLevel: calculateMax(decryptedDataList, "noise_level"),
          wasteAlerts: decryptedDataList.filter((row) => row.waste_level > 50).length,
        };

        setInsights(calculatedInsights);

        // ✅ Compatible with both RandomForest and LSTM prediction formats
        const modelPrediction = result.latest_prediction;
        if (typeof modelPrediction === "string" || typeof modelPrediction === "number") {
           const formattedPrediction = Number(modelPrediction).toFixed(2);
           setPrediction(formattedPrediction);
           setPredictionCategory(predictCategory(modelPrediction));
           setPredictionTime("in 1 hour");  // ✅ you can make this dynamic later
        } 
        else if (Array.isArray(modelPrediction)) {
          const formattedPrediction = Number(modelPrediction[0]).toFixed(2);
          setPrediction(formattedPrediction);
          setPredictionCategory(predictCategory(modelPrediction[0]));
          setPredictionTime("in 1 hour");
        } 
        else {
          setPrediction("N/A");
          setPredictionCategory("Unknown");
          setPredictionTime("-");
        }
      } 
      catch (error) {
        console.error("Error fetching insights:", error.response?.data || error);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const calculateAverage = (data, field) => {
    if (!data.length) return 0;
    const sum = data.reduce((total, item) => total + (parseFloat(item[field]) || 0), 0);
    return (sum / data.length).toFixed(2);
  };

  const calculateMax = (data, field) => {
    if (!data.length) return 0;
    return Math.max(...data.map(item => parseFloat(item[field]) || 0));
  };

  // Prepare data for charts
  const temperatureData = {
    labels: sensorData.map(entry => entry.Time),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: sensorData.map(entry => entry.temperature),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const humidityData = {
    labels: sensorData.map(entry => entry.Time),
    datasets: [
      {
        label: 'Humidity (%)',
        data: sensorData.map(entry => entry.humidity),
        borderColor: 'rgb(50, 82, 104)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const airQualityData = {
    labels: sensorData.map(entry => entry.Time),
    datasets: [
      {
        label: 'Air Quality (AQI)',
        data: sensorData.map(entry => entry.air_quality),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
  
 <div className="view-insights-wrapper">
  <div className="view-insights-container">
    <h1>Environmental Insights</h1>

    <div className="insights-grid">
      <div className="insight-card">
        <h3>Predicted Air Quality</h3>
        <p>{prediction} AQI</p>
        <p>Time: {predictionTime}</p>
        <p>
          Category:{" "}
          <span className={`category-tag ${predictionCategory.toLowerCase().replace(/\s+/g, '-')}`}>
            {predictionCategory}
          </span>
        </p>
      </div>

      <div className="insight-card">
        <h3>Average Temperature</h3>
        <p>{insights.avgTemperature || "N/A"} °C</p>
      </div>

      <div className="insight-card">
        <h3>Average Humidity</h3>
        <p>{insights.avgHumidity || "N/A"} %</p>
      </div>

      <div className="insight-card">
        <h3>Average Air Quality</h3>
        <p>{insights.avgAirQuality || "N/A"} AQI</p>
      </div>

      <div className="insight-card">
        <h3>Noise Level</h3>
        <p>{insights.maxNoiseLevel || "N/A"} dB</p>
      </div>

      <div className="insight-card">
        <h3>Waste Alerts</h3>
        <p>{insights.wasteAlerts ?? 0} times</p>
      </div>
    </div>

    <div className="charts-container">
      <div className="chart-card">
        <h3>Temperature Trend</h3>
        <Line data={temperatureData} />
      </div>
      <div className="chart-card">
        <h3>Humidity Trend</h3>
        <Line data={humidityData} />
      </div>
      <div className="chart-card">
        <h3>Air Quality Trend</h3>
        <Line data={airQualityData} />
      </div>
    </div>
  </div>
</div>


);

};

export default ViewInsights;
