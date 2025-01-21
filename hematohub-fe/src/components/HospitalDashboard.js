import React from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDashboard.css";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const hospitalData = JSON.parse(localStorage.getItem("hospital"));

  const handleLogout = () => {
    localStorage.removeItem("hospital");
    localStorage.removeItem("userType");
    alert("Logged out successfully!");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {hospitalData?.hospitalName || "Hospital"}!</h2>
      <p>Location: {hospitalData?.location || "Not Provided"}</p>
      <p>Email: {hospitalData?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HospitalDashboard;
