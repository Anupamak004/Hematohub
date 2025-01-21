import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const donorData = JSON.parse(localStorage.getItem("donor"));
    const hospitalData = JSON.parse(localStorage.getItem("hospital"));

    if (donorData && donorData.email === email && donorData.password === password) {
      localStorage.setItem("userType", "donor");
      alert("Login Successful! Redirecting to Donor Dashboard.");
      window.open("/donor-dashboard", "_blank"); // Open in new tab
    } 
    else if (hospitalData && hospitalData.email === email && hospitalData.password === password) {
      localStorage.setItem("userType", "hospital");
      alert("Login Successful! Redirecting to Hospital Dashboard.");
      window.open("/hospital-dashboard", "_blank"); // Open in new tab
    } 
    else {
      alert("Invalid Credentials! Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
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
      <p>
        Don't have an account? 
        <span className="register-link" onClick={() => navigate("/register-donor")}> Register as Donor</span> | 
        <span className="register-link" onClick={() => navigate("/register-hospital")}> Register as Hospital</span>
      </p>
    </div>
  );
};

export default Login;
