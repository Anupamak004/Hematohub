import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorDashboard.css";
import { FaSignOutAlt, FaHistory, FaUser, FaEdit, FaBars, FaTimes } from "react-icons/fa";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [disease, setDisease] = useState(null);
  const [medications, setMedications] = useState(null);
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

  const age = calculateAge(donorData?.dob);

  const formatDate = (dob) => {
    return new Date(dob).toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
  };
  

  const calculateNextDonationDate = (lastDonationDate) => {
    if (lastDonationDate ) {
      // If last donation is available, add 90 days
      const nextEligibleDate = new Date(lastDonationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);
      return nextEligibleDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    } else {
      // If no last donation, eligible from today
      return new Date().toISOString().split("T")[0];
    }
  };
  
  const bmi = (donorData?.weight && donorData?.height) ? (donorData?.weight / ((donorData?.height / 100) ** 2)).toFixed(1) : null;


  useEffect(() => {
    if (!donorData) return;
    const age = calculateAge(donorData?.dob);
    const nextDonationDate = calculateNextDonationDate(donorData?.lastDonation);
    const currentDate = new Date().toISOString().split("T")[0];
  
    if (age < 18 || age > 65) {
      setEligibility("❌ No, you are not eligible (Age must be 18-65)");
    } else if (bmi && (bmi < 18.5 || bmi > 30)) {
      setEligibility("❌ No, you are not eligible (Unhealthy BMI)");
    } else if (disease === "Yes" || medications === "Yes") {
      setEligibility("❌ No, you are not eligible (Health condition)");
    } else if (new Date(currentDate) < new Date(nextDonationDate)) {
      setEligibility(`❌ No, you can donate after ${nextDonationDate}`);
    } else {
      setEligibility("✅ Yes, you are eligible!");
    }
  }, [donorData, height, weight, disease, medications]);
  
  

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT Token from storage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:5000/api/donors/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch donor data");
        }

        const data = await response.json();
        setDonorData(data);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        alert("Error fetching donor data, please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    navigate("/login");
  };

  if (loading) {
    return <p>Loading donor data...</p>;
  }
  
  if (error) {
    return <p>Error: {error}</p>;
  }
  

  return (
    
    <div className="dashboard-container">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Donor Sidebar */}
      <div className={`donorsidebar ${sidebarOpen ? "open" : ""}`}>
        <button onClick={() => navigate("/donor-dashboard")}> <FaUser /> Profile </button>
        <button onClick={() => navigate("/donor/edit-profile")}> <FaEdit /> Edit Profile </button>
        <button onClick={() => navigate("/donor/donation-history")}> <FaHistory /> Donation History </button>
        <button onClick={handleLogout}> <FaSignOutAlt /> Logout </button>
      </div>

      {/* Main Content */}
      <div className={`dashboard-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="profile-section">
          <h2 className="profile-head">PROFILE</h2>
          <div className="profile-card">
            <div className="profile-header">
              <FaUser className="profile-icon" />
              <h2>{donorData?.name || "Donor"}</h2>
              </div>
            <div className="profile-details">
            <p><strong>Blood Type : </strong> {donorData?.bloodType || "Not Provided"}</p>
            <p><strong>Date of Birth : </strong> {donorData?.dob ? formatDate(donorData.dob) : "Not Provided"}</p>
            <p><strong>Age : </strong> {donorData ? age : "Not Provided"}</p>
            <p><strong>Email : </strong> {donorData?.email || "Not Provided"}</p>
            <p><strong>Phone : </strong> {donorData?.mobile || "Not Provided"}</p>
            <p><strong>Height(cm) : </strong> {donorData?.height || "Not Provided"}</p>
            <p><strong>Weight(kg) : </strong> {donorData?.weight || "Not Provided"}</p>
            <p><strong>BMI : </strong> {donorData ? bmi : "Not Provided"}</p>

            <p><strong>Last Donation Date : </strong> {donorData?.lastDonation ? formatDate(donorData.lastDonation) : "Not Available"}</p>
            <p><strong>Eligible To Donate From:</strong> {eligibility.includes("✅") ?calculateNextDonationDate(donorData?.lastDonation, donorData?.registrationDate):"N/A"}</p>
            <p><strong>Eligibility : </strong> 
             <span style={{ color: eligibility.includes("✅") ? "green" : "red", fontWeight: "bold" }}>
              {eligibility}
            </span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;