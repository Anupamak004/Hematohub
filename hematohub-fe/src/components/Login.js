import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [userType, setUserType] = useState("donor"); // Default: Donor
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem(userType)); // Fetch user data based on type

    if (userData && userData.email === email && userData.password === password) {
      localStorage.setItem("userType", userType);
      alert(`${userType.charAt(0).toUpperCase() + userType.slice(1)} Login Successful! Redirecting...`);

      switch (userType) {
        case "donor":
          navigate("/donor-dashboard");
          break;
        case "hospital":
          window.open("/hospital-dashboard", "_blank");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          console.error("Invalid user type.");
      }
    } else {
      alert("Invalid Credentials! Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>

        {/* User Type Selection */}
        <div className="user-type-select">
          <label className={userType === "donor" ? "selected" : ""}>
            <input
              type="radio"
              name="userType"
              value="donor"
              checked={userType === "donor"}
              onChange={() => setUserType("donor")}
            />
            Donor
          </label>
          <label className={userType === "hospital" ? "selected" : ""}>
            <input
              type="radio"
              name="userType"
              value="hospital"
              checked={userType === "hospital"}
              onChange={() => setUserType("hospital")}
            />
            Hospital
          </label>
          <label className={userType === "admin" ? "selected" : ""}>
            <input
              type="radio"
              name="userType"
              value="admin"
              checked={userType === "admin"}
              onChange={() => setUserType("admin")}
            />
            Admin
          </label>
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
          <button type="submit">Login</button>
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
