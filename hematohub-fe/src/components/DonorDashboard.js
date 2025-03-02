import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorDashboard.css";
import { FaSignOutAlt, FaHistory, FaUser, FaEdit, FaBars, FaTimes } from "react-icons/fa";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const donorData = JSON.parse(localStorage.getItem("donor")) || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [height, setHeight] = useState(donorData.height || "");
  const [weight, setWeight] = useState(donorData.weight || "");
  const [disease, setDisease] = useState(donorData.disease || "No");
  const [medications, setMedications] = useState(donorData.medications || "No");
  const [eligibility, setEligibility] = useState("Checking...");

  const calculateAge = (dob) => {
    if (!dob) return "Not Provided";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(donorData.dob);

  useEffect(() => {
    const bmi = (weight && height) ? (weight / ((height / 100) ** 2)).toFixed(1) : null;

    if (age < 18 || age > 65) {
      setEligibility("No, you are not eligible (Age must be 18-65)");
    } else if (bmi && (bmi < 18.5 || bmi > 30)) {
      setEligibility("No, you are not eligible (Unhealthy BMI)");
    } else if (disease === "Yes" || medications === "Yes") {
      setEligibility("No, you are not eligible (Health condition)");
    } else {
      setEligibility("Yes, you are eligible!");
    }
  }, [age, height, weight, disease, medications]);

  const handleLogout = () => {
    localStorage.removeItem("donor");
    localStorage.removeItem("userType");
    alert("Logged out successfully!");
    navigate("/");
  };

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar after navigating
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Donor Sidebar */}
      <div className={`donorsidebar ${sidebarOpen ? "open" : ""}`}>
        <button onClick={() => navigateTo("/donor-dashboard")}> <FaUser /> Profile </button>
        <button onClick={() => navigateTo("/donor/edit-profile")}> <FaEdit /> Edit Profile </button>
        <button onClick={() => navigateTo("/donor/donation-history")}> <FaHistory /> Donation History </button>
        <button onClick={handleLogout}> <FaSignOutAlt /> Logout </button>
      </div>

      {/* Main Content */}
      <div className={`dashboard-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="profile-section">
          <h2 className="profile-head">PROFILE</h2>
          <div className="profile-card">
            <div className="profile-header">
              <FaUser className="profile-icon" />
              <h2>{donorData.name || "Donor"}</h2>
            </div>
            <div className="profile-details">
              <p><strong>Blood Type:</strong> {donorData.bloodType || "Not Provided"}</p>
              <p><strong>Date of Birth:</strong> {donorData.dob || "Not Provided"}</p>
              <p><strong>Age:</strong> {age}</p>
              <p><strong>Email:</strong> {donorData.email || "Not Provided"}</p>
              <p><strong>Phone:</strong> {donorData.phone || "Not Provided"}</p>
              <p><strong>Last Donation Date:</strong> {donorData.lastDonation || "Not Available"}</p>
              <p><strong>Next Eligible Donation:</strong> {donorData.nextDonation || "Not Available"}</p>
              <p><strong>Eligibility:</strong> <span className={`eligibility ${eligibility.startsWith("No") ? "not-eligible" : "eligible"}`}>{eligibility}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
