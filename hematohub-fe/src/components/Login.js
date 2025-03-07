import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [userType, setUserType] = useState("donor"); // Default: Donor
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Updated API URL

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      console.log("Logging in as:", userType);
  
      const response = await fetch(`${API_BASE_URL}/api/${userType}s/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      console.log("Raw response:", response);
  
      // Check if response has content before calling .json()
      const text = await response.text(); // Read response as text
      console.log("Raw response text:", text);
  
      let data;
      try {
        data = JSON.parse(text); // Try to parse JSON
      } catch (error) {
        throw new Error("Invalid JSON received from server");
      }
  
      console.log("Parsed response data:", data);
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", data.userId || "");
  
      alert("Login successful!");
      navigate(`/${userType}-dashboard`);
    } catch (error) {
      console.error("Login Error:", error.message);
      alert(error.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>

        {/* User Type Selection */}
        <div className="user-type-select">
          {["donor", "hospital", "admin"].map((type) => (
            <label key={type} className={userType === type ? "selected" : ""}>
              <input
                type="radio"
                name="userType"
                value={type}
                checked={userType === type}
                onChange={() => setUserType(type)}
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
  );
};

export default Login;
