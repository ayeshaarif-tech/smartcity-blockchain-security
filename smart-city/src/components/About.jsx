import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>About Our Project</h1>
      <p className="overview">
        Our project, <strong>Secure and Sustainable Smart City using Blockchain</strong>, integrates IoT sensors with blockchain to monitor and manage environmental factors in real-time. 
        The system ensures secure, immutable, and efficient data storage using a hybrid encryption method, IPFS, and a private Ethereum blockchain. 
        This solution aims to provide predictive insights and anomaly detection to promote sustainability and smarter urban planning.
      </p>

      <div className="team-section">
        <h2>Group Members</h2>
        <ul className="team-list">
          <li>Ayesha Arif</li>
          <li>Talha Khan</li>
          <li>Laiba Batool</li>
        </ul>
      </div>

      <div className="supervisor-section">
        <h2>Supervisors</h2>
        <ul className="supervisor-list">
          <li>Mr. Zohaib Sajjad Shah</li>
          <li>Mr. Muhammad Kamran</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
