import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import About from './components/About';
import ViewData from './components/ViewData';
import ViewInsights from './components/ViewInsights';
import GenerateReport from './components/GenerateReport';
import Alerts from './components/Alerts';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
  return localStorage.getItem("isLoggedIn") === "true";
});
  const [sensorData, setSensorData] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleLogin = () => {
  localStorage.setItem("isLoggedIn", "true");
  setIsLoggedIn(true);
  fetchData();
};

  const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  setIsLoggedIn(false);
  setSensorData(null);
  setPrediction(null);
};


  // Fetch Decrypted Sensor Data and ML Prediction
  const fetchData = async () => {
    try {
      const sensorResponse = await fetch("http://localhost:8000/fetch_latest");
      const sensorJson = await sensorResponse.json();
      setSensorData(sensorJson.decrypted_data);

      const predictionResponse = await fetch("http://localhost:8000/predict_latest");
      const predictionJson = await predictionResponse.json();
      setPrediction(predictionJson.prediction);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  return (
    <div className="app-container">
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
        
        {/* Protected Routes with Sensor Data & Predictions */}
        <Route element={<ProtectedRoute isAuthenticated={isLoggedIn} />}>
          <Route path="/dashboard" element={<Dashboard sensorData={sensorData} prediction={prediction} />} />
          <Route path="/about" element={<About />} />
          <Route path="/viewdata" element={<ViewData sensorData={sensorData} />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/viewinsights" element={<ViewInsights sensorData={sensorData} prediction={prediction} />} />
          <Route path="/generatereport" element={<GenerateReport />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
