import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorHistory.css";

const DonorHistory = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    // Simulated API call (Replace with actual API request)
    fetch("/api/donations") 
      .then(response => response.json())
      .then(data => {
        const updatedData = data.map(donation => {
          const prevDate = new Date(donation.previousDonationDate);
          const nextEligibleDate = new Date(prevDate);
          nextEligibleDate.setMonth(prevDate.getMonth() + 3); // Add 3 months

          return {
            ...donation,
            nextEligibleDate: nextEligibleDate.toISOString().split("T")[0] // Format YYYY-MM-DD
          };
        });

        setDonations(updatedData);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const goBack = () => {
    navigate("/donor-dashboard");
  };

  return (
    <div className="donation-history-container">
      <h2>Donation History</h2>
      <table>
        <thead>
          <tr>
            <th>Previous Donation Date</th>
            <th>Next Eligible Date</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation, index) => (
            <tr key={index}>
              <td>{donation.previousDonationDate}</td>
              <td>{donation.nextEligibleDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={goBack}>Back to Dashboard</button>
    </div>
  );
};

export default DonorHistory;