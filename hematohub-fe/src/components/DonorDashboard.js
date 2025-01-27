import React from "react";
import { useNavigate } from "react-router-dom";
import "./DonorDashboard.css";
import { FaSignOutAlt, FaHistory, FaUser, FaEdit } from "react-icons/fa";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const donorData = JSON.parse(localStorage.getItem("donor")) || {};

  const handleLogout = () => {
    localStorage.removeItem("donor");
    localStorage.removeItem("userType");
    alert("Logged out successfully!");
    navigate("/");
  };

  const viewDonationHistory = () => {
    navigate("/donation-history");
  };

  const editProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h3>Donor Panel</h3>
        <ul>
          <li><button onClick={viewDonationHistory}><FaHistory /> Donation History</button></li>
          <li><button onClick={editProfile}><FaEdit /> Edit Profile</button></li>
          <li><button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Logout</button></li>
        </ul>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="profile-card">
          <FaUser className="profile-icon" />
          <h2>Welcome, {donorData.name || "Donor"}!</h2>
          <p><strong>Blood Type:</strong> {donorData.bloodType || "Not Provided"}</p>
          <p><strong>Email:</strong> {donorData.email || "Not Provided"}</p>
          <p><strong>Phone:</strong> {donorData.phone || "Not Provided"}</p>
          <p><strong>Last Donation Date:</strong> {donorData.lastDonation || "Not Available"}</p>
          <button className="edit-btn" onClick={editProfile}><FaEdit /> Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;