import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const RegisterDonor = () => {
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const donorData = { name, bloodType, email, password };
    localStorage.setItem("donor", JSON.stringify(donorData));
    alert("Donor Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="register-container">
      <h2>Register as a Blood Donor</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Blood Type (e.g. A+, B-)" value={bloodType} onChange={(e) => setBloodType(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterDonor;
