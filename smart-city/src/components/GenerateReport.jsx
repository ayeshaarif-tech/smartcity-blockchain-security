import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "chart.js/auto";
import "./GenerateReport.css";

const GenerateReport = () => {
  const [sensorData, setSensorData] = useState([]);
  const [insights, setInsights] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const chartRef = useRef();
  const [predictionCategory, setPredictionCategory] = useState("");
  const [predictionTime, setPredictionTime] = useState("");
  useEffect(() => {fetchPrediction();}, []);



 const fetchData = () => {
  fetch("http://localhost:8000/fetch_latest")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // 1. Filter out entries missing temperature or humidity
      const validData = (data.decrypted_data_list || []).filter(
        (entry) =>
          entry.data &&
          entry.data.temperature !== undefined &&
          entry.data.humidity !== undefined
      );

      // 2. Take the last 10 valid entries
      const recentData = validData.slice(-10);

      // 3. Reshape the data
      const reshapedData = recentData.map((entry) => ({
        Timestamp: entry.timestamp,
        ...entry.data,
      }));

      setSensorData(reshapedData);

      // 4. Generate insights
      const insights = {
        avgTemperature: calculateAverage(reshapedData, "temperature"),
        avgHumidity: calculateAverage(reshapedData, "humidity"),
        avgAirQuality: calculateAverage(reshapedData, "air_quality"),
        maxVibration: calculateMax(reshapedData, "noise_level"),
        wasteAlerts: reshapedData.filter((row) => row.waste_level === "High" || row.waste_level > 50).length,
      };

      const alerts = reshapedData
        .filter(
          (row) =>
            row.temperature > 40 ||
            row.humidity > 85 ||
            row.air_quality > 200 ||
            row.waste_level === "High" || row.waste_level > 50
        )
        .map((row) => ({
          time: row.Timestamp,
          alert:
            row.temperature > 40
              ? "High Temperature"
              : row.humidity > 85
              ? "High Humidity"
              : row.air_quality > 200
              ? "Hazardour Gases"
              : "Waste Overflow",
        }));

      setInsights(insights);
      setAlerts(alerts);
    })
    .catch((error) => console.error("Error fetching data:", error));
};


  const fetchPrediction = () => {
    fetch("http://localhost:8000/predict_latest")      // ← same endpoint used in ViewInsights
    .then((res) => res.json())
    .then((data) => {
      const modelPrediction = data.latest_prediction;

      // helper to turn AQI → textual category
      const predictCategory = (value) => {
        if (value <= 50) return "Good";
        if (value <= 100) return "Moderate";
        if (value <= 150) return "Unhealthy for Sensitive Groups";
        if (value <= 200) return "Unhealthy";
        if (value <= 300) return "Very Unhealthy";
        return "Hazardous";
      };

      if (typeof modelPrediction === "string" || typeof modelPrediction === "number") {
        const p = Number(modelPrediction).toFixed(2);
        setPrediction(p);
        setPredictionCategory(predictCategory(modelPrediction));
        setPredictionTime("in 1 hour");          // keep or make dynamic later
      } else if (Array.isArray(modelPrediction)) {
        const p = Number(modelPrediction[0]).toFixed(2);
        setPrediction(p);
        setPredictionCategory(predictCategory(modelPrediction[0]));
        setPredictionTime("in 1 hour");
      } else {
        setPrediction("N/A");
        setPredictionCategory("Unknown");
        setPredictionTime("-");
      }
    })
    .catch((err) => console.error("Prediction fetch error:", err));
};


  const calculateAverage = (data, field) => {
    const validValues = data.map((row) => parseFloat(row[field])).filter((val) => !isNaN(val));
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return validValues.length > 0 ? (sum / validValues.length).toFixed(2) : "0.00";
  };

  const calculateMax = (data, field) => {
    const valid = data.map((row) => parseFloat(row[field])).filter((v) => !isNaN(v));
    return valid.length ? Math.max(...valid) : "0";
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Sensor Report - Last 10 Entries", 10, 10);

    doc.autoTable({
      head: [["Time", "IR Distance", "Temperature", "Humidity", "Vibration", "PPM"]],
      body: sensorData.map((row) => [
        row.Timestamp,
        row.waste_level,
        row.temperature,
        row.humidity,
        row.noise_level,
        row.air_quality,
      ]),
      startY: 20,
    });

    // Alerts Section
    const alertsStartY = doc.lastAutoTable.finalY + 10;
    doc.text("Alerts", 10, alertsStartY);
    doc.autoTable({
      head: [["Time", "Alert"]],
      body: alerts.length ? alerts.map((a) => [a.time, a.alert]) : [["-", "No alerts"]],
      startY: alertsStartY + 5,
    });

    // Insights Section
    const insightsStartY = doc.lastAutoTable.finalY + 10;
    doc.text("Insights", 10, insightsStartY);
    doc.text(`Average Temperature: ${insights.avgTemperature}°C`, 10, insightsStartY + 10);
    doc.text(`Average Humidity: ${insights.avgHumidity}%`, 10, insightsStartY + 20);
    doc.text(`Average Air Quality (PPM): ${insights.avgAirQuality}`, 10, insightsStartY + 30);
    doc.text(`Maximum Vibration: ${insights.maxVibration}`, 10, insightsStartY + 40);
    doc.text(`Waste Alerts: ${insights.wasteAlerts}`, 10, insightsStartY + 50);

    // Prediction Section
    const predY = insightsStartY + 70;
    doc.text("Prediction", 10, predY);
    doc.text(`Predicted AQI: ${prediction || "N/A"}`, 10, predY + 10);
    doc.text(`Category: ${predictionCategory || "-"}`, 10, predY + 20);
    doc.text(`Time: ${predictionTime || "-"}`, 10, predY + 30);


    // Chart Image
    const chartCanvas = chartRef.current;
    const chartImage = chartCanvas.toBase64Image();
    doc.addPage();
    doc.text("Sensor Trends", 10, 10);
    doc.addImage(chartImage, "PNG", 10, 20, 180, 100);

    doc.save("Sensor_Report.pdf");
  };

  useEffect(() => {
    fetchData();
    fetchPrediction();
  }, []);

  const sensorChartData = {
    labels: sensorData.map((row) => row.Timestamp),
    datasets: [
      {
        label: "Temperature (°C)",
        data: sensorData.map((row) => parseFloat(row.temperature)),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
      {
        label: "Humidity (%)",
        data: sensorData.map((row) => parseFloat(row.humidity)),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
       {
        label: "Air-Quality (PPM)",
        data: sensorData.map((row) => parseFloat(row.air_quality)),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="report-container">
      <h1>Generate Report</h1>
      <button className="generate-btn" onClick={generatePDF}>
        Download Report as PDF
      </button>

      <div className="data-section">
        <h2>Latest Sensor Data</h2>
        <table className="sensor-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>IR Distance</th>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>Vibration</th>
              <th>PPM</th>
            </tr>
          </thead>
          <tbody>
            {sensorData.map((row, index) => (
              <tr key={index}>
                <td>{row.Timestamp}</td>
                <td>{row.waste_level}</td>
                <td>{row.temperature}</td>
                <td>{row.humidity}</td>
                <td>{row.noise_level}</td>
                <td>{row.air_quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="charts-container">
        <h2>Sensor Trends</h2>
        <div className="chart-wrapper">
          <Line data={sensorChartData} ref={chartRef} />
        </div>
      </div>

      <div className="alerts-section">
        <h2>Generated Alerts</h2>
        {alerts.length > 0 ? (
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>
                {alert.time}: {alert.alert}
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts generated in the last 10 entries.</p>
        )}
      </div>

      <div className="prediction-section">
  <h2>ML Prediction</h2>
  <div className="pred-wrapper">
    {prediction ? (
    <>
      <p>{prediction} AQI</p>
      <p>Time: {predictionTime}</p>
      <p>
        Category:{" "}
        <span className={`category-tag ${predictionCategory.toLowerCase().replace(/\s+/g, '-')}`}>
          {predictionCategory}
        </span>
      </p>
    </>
  ) : (
    <p>Fetching prediction…</p>
  )}
  </div>
  
</div>

    </div>
  );
};

export default GenerateReport;
