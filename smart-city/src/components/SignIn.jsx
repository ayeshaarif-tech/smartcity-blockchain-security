import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import backgroundImage from '../assets/background.jpg'; // Import the background image

const SignIn = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();

    // Retrieve users from local storage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.username === username);

    if (user && user.password === password) {
      onLogin();
      navigate("/dashboard"); // Navigate to dashboard if credentials are correct
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div
  style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "100vh", // Full height of the viewport
    width: "100vw",  // Full width of the viewport
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}

> <h1 className="signup-title">Secure and Sustainable Smart City using Blockchain</h1>
  <div className="signin-container">
    <form onSubmit={handleSignIn}>
      <h2>Sign In</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button>Login</button>
      {error && <p className="error-message">{error}</p>}
    </form>
    <p>
      Don't have an account? <a href="/signup">Sign up</a>
    </p>
  </div>
</div>
  );
};

export default SignIn;
