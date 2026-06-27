import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import backgroundImage from '../assets/bg.jpeg'; // Import the image

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Retrieve existing users from local storage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the username is already taken
    if (users.find((u) => u.username === username)) {
      setError("Username already exists.");
      return;
    }

    // Add the new user to local storage
    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setSuccess("Account created successfully!");
    setError("");
    setTimeout(() => navigate("/signin"), 2000); // Redirect to Sign In page after 2 seconds
  };

  return (
    <div 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",  // Ensure image covers the full screen
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        height: "100vh",  // Full viewport height
        width: "100vw",   // Full viewport width
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div className="signup-container">
        <form onSubmit={handleSignUp}>
          <h2>Sign Up</h2>
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
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
        <p>
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
