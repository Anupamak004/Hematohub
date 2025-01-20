import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const RegisterHospital = () => {
  const [hospitalName, setHospitalName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const hospitalData = { hospitalName, location, email, password };
    localStorage.setItem("hospital", JSON.stringify(hospitalData));
    alert("Hospital Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="register-container">
      <h2>Register as a Hospital</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Hospital Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterHospital;
