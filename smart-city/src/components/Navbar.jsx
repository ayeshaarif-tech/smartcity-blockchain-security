import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css'; // Ensure the correct CSS file is linked for styling

const Navbar = ({ onLogout }) => {
  return (
    <div className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-title">Environmental Monitoring in Smart City</div>
        <div className="navbar-buttons">
          <Link to="/dashboard" className="nav-button">Dashboard</Link>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
