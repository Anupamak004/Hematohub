import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";  // Import the updated styles

const Home = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const donorData = JSON.parse(localStorage.getItem("donor"));
    const hospitalData = JSON.parse(localStorage.getItem("hospital"));

    if (
      (donorData && donorData.email === email && donorData.password === password) ||
      (hospitalData && hospitalData.email === email && hospitalData.password === password)
    ) {
      alert("Login Successful!");
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials! Please try again.");
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Hematohub</h1>

      {/* Login Area */}
      <div className="login-area">
        <h3>Login Here</h3>
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
      </div>
    </div>
  );
};

export default Home;
