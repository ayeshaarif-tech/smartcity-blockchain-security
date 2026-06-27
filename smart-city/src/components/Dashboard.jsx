import React from "react";
import './Dashboard.css';
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleAlert = () => {
    alert("Sensor values exceed the threshold! Immediate action required.");
  };

  return (
    <div className="dashboard-container">
    
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Welcome to the Smart City Dashboard</h1>
        <p>Monitor, analyze, and act on environmental data in real-time.</p>
      </div>

      {/* Dashboard Main Content */}
      <div className="dashboard-content">
        {/* Functionality Cards */}
        <div className="card">
          <h3>View Real-Time Data</h3>
          <p>See the latest sensor values from various monitoring devices.</p>
          <button onClick={() => navigate("/viewdata")}>View Data</button> {/* Navigate to ViewData.jsx */}
        </div>
        <div className="card">
          <h3>Generate Report</h3>
          <p>Download a detailed PDF report of recent sensor data and analysis.</p>
          <button onClick={() => navigate("/generatereport")}>Generate Report</button> {/* Navigate to ViewData.jsx */}
        </div>
        <div className="card">
          <h3>View Insights</h3>
          <p>Access predictive analysis and historical trends from sensor data.</p>
          <button onClick={() => navigate("/viewinsights")}>View Insights</button> {/* Navigate to ViewInsights.jsx */}
        </div>
        <div className="card">
          <h3>Alerts</h3>
          <p>View trigger alerts.</p>
          <button onClick={() => navigate("/alerts")}>View Alert</button> {/* Navigate to Alerts.jsx */}
        </div>
        <div className="card">
          <h3>About the Project</h3>
          <p>Learn about the project, team members, and supervisors.</p>
          <button onClick={() => navigate("/about")}>About</button> {/* Corrected navigate usage */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
