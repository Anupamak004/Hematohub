import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // Retrieve user data from local storage
  const donorData = JSON.parse(localStorage.getItem("donor"));
  const hospitalData = JSON.parse(localStorage.getItem("hospital"));

  // Determine user type
  const user = donorData ? donorData : hospitalData ? hospitalData : null;
  const userType = donorData ? "Donor" : "Hospital";

  const handleLogout = () => {
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user ? user.name || user.hospitalName : "User"}!</h2>
      <p>You are logged in as a <strong>{userType}</strong>.</p>
      
      <div className="dashboard-info">
        {userType === "Donor" && (
          <>
            <p><strong>Blood Type:</strong> {user.bloodType}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}
        {userType === "Hospital" && (
          <>
            <p><strong>Location:</strong> {user.location}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
