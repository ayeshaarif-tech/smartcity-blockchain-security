// src/components/ViewData.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewData.css";

const ViewData = () => {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchDecryptedData();

    // Set interval to fetch data every 2 seconds
    const interval = setInterval(() => {
      fetchDecryptedData();
    }, 2000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchDecryptedData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/fetch_latest");
      setDataList(response.data.decrypted_data_list);
    } catch (error) {
      console.error("Error fetching decrypted data:", error);
    }
  };

  // Helper function to get air quality category
  const getAirQualityCategory = (aqi) => {
    if (aqi <= 50) return "Good";
    else if (aqi <= 100) return "Moderate";
    else if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    else if (aqi <= 200) return "Unhealthy";
    else if (aqi <= 300) return "Very Unhealthy";
    else return "Hazardous";
  };

  return (
    <div className="view-data-container">
      <h1 className="title">Latest Sensor Data</h1>

      <div className="table-container">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Air Quality</th>
              <th>Noise Level</th>
              <th>Waste Level</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((entry, index) => (
              <tr key={index}>
                <td>{entry.timestamp}</td>
                <td>{entry.data.temperature}</td>
                <td>{entry.data.humidity}</td>
                <td>
                  {getAirQualityCategory(entry.data.air_quality)}
                </td>
                <td>{entry.data.noise_level === 1 ? "High" : "Low"}</td>
                <td>{entry.data.waste_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewData;
