import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Updated styles
import  { useState } from "react";
import axios from "axios";
import "./Login.css";

const Introduction = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("donor"); // Default: Donor
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // API URL

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Logging in as:", userType);

      // API endpoint (Admin has a different endpoint)
      const endpoint =
        userType === "admin"
          ? `${API_BASE_URL}/api/admin/login`
          : `${API_BASE_URL}/api/${userType}s/login`;

      const res = await axios.post(endpoint, { email, password });
      const { token } = res.data;

      localStorage.setItem("adminToken", token);
      console.log("Token stored:", token);
      // Store token & user details
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("donorId", res.data.userId || "");
      console.log(res.data.userId);

      alert("Login successful!");

      // Redirect based on user type
      navigate(userType === "admin" ? "/admin-dashboard" : `/${userType}-dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="introduction-container">
      {/* Background Overlay */}
      <div className="overlay"></div>

      <div className="intro-content">
        <h1 className="fade-in">HematoHub : Where Every Drop Fuels a Life</h1>
        <h3>Welcome to <span className="highlight">HematoHub</span></h3>

        <p className="intro-text">
          A smart, efficient, and life-saving <b>Blood Bank Management System </b> 
          designed to seamlessly connect <b>generous donors</b> with <b>hospitals in need</b>.
        </p>

        <div className="animated-list">
          <p>🚑 <b>Urgent need for blood?</b> We’ve got you covered.</p>
          <p>❤ <b>Ready to donate and save lives?</b> Join us today!</p>
          <p>🌍 <b>Together, we build a healthier community.</b></p>
        </div>

        {/* Buttons */}
        <div className="intro-buttons">
          {/*<button className="btn primary glow" onClick={() => navigate("/login")}>Login</button>
          <button className="btn secondary glow" onClick={() => navigate("/register")}>Donate Now</button>
          <button className="btn tertiary glow" onClick={() => navigate("/register?type=hospital")}>Hospital Registration</button>*/}
          <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        {/* User Type Selection */}
        <div className="user-type-select">
          {["donor", "hospital", "admin"].map((type) => (
            <label key={type} className={userType === type ? "selected" : ""}>
              <input
                type="radio"
                name="userType"
                value={type}
                checked={userType === type}
                onChange={() => {
                  setUserType(type);
                  setEmail(""); // Clear email field
                  setPassword(""); // Clear password field
                }}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Links */}
        <p>
          Don't have an account? <br />
          <span className="register-link" onClick={() => navigate("/register")}>
            Register as Donor
          </span>{" "}
          |{" "}
          <span
            className="register-link"
            onClick={() => navigate("/register?type=hospital")}
          >
            Register as Hospital
          </span>
        </p>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;


