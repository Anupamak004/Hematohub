import React from "react";
import { useNavigate } from "react-router-dom";
import "./DonorDashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const donorData = JSON.parse(localStorage.getItem("donor"));

  const handleLogout = () => {
    localStorage.removeItem("donor");
    localStorage.removeItem("userType");
    alert("Logged out successfully!");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {donorData?.name || "Donor"}!</h2>
      <p>Blood Type: {donorData?.bloodType || "Not Provided"}</p>
      <p>Email: {donorData?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
