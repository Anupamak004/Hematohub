import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Check local storage for donor or hospital credentials
    const donorData = JSON.parse(localStorage.getItem("donor"));
    const hospitalData = JSON.parse(localStorage.getItem("hospital"));

    if (
      (donorData && donorData.email === email && donorData.password === password) ||
      (hospitalData && hospitalData.email === email && hospitalData.password === password)
    ) {
      alert("Login Successful!");
      navigate("/dashboard"); // Redirect to Dashboard
    } else {
      alert("Invalid Credentials! Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <span className="register-link" onClick={() => navigate("/")}>Register here</span></p>
    </div>
  );
};

export default Login;
