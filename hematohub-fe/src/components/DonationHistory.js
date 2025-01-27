import React from "react";
import { useNavigate } from "react-router-dom";
import "./DonationHistory.css"; 

const DonationHistory = () => {
  const navigate = useNavigate();

  // Example donation history data
  const donations = [
    { date: "2024-01-15", location: "Central Hospital" },
    { date: "2023-12-10", location: "City Blood Bank" },
    { date: "2023-11-05", location: "Main Clinic" },
  ];

  const goBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="donation-history-container">
      <h2>Donation History</h2>
      <ul>
        {donations.map((donation, index) => (
          <li key={index}>
            <p>Date: {donation.date}</p>
            <p>Location: {donation.location}</p>
          </li>
        ))}
      </ul>
      <button onClick={goBack}>Back to Dashboard</button>
    </div>
  );
};

export default DonationHistory;
