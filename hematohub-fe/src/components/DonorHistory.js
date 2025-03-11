import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DonorHistory = ({ donorId = localStorage.getItem("donorId") }) => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch donation history from backend
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/donors/${donorId}/donations`);
        if (!response.ok) throw new Error("Failed to fetch donation history");
        const data = await response.json();
        setDonations(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [donorId]);

  // Handle updating last donation date
  const handleUpdateDonation = async () => {
    const newDate = prompt("Enter last donation date (YYYY-MM-DD):");
    if (!newDate) return;

    try {
        const response = await fetch(`http://localhost:5000/api/donors/${donorId}/donations`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastDonation: newDate }),
        });

        if (response.ok) {
            const updatedData = await response.json();
            setDonations(updatedData.donationHistory); // Append new donation history
        } else {
            console.error("Failed to update donation");
        }
    } catch (error) {
        console.error("Error updating donation:", error);
    }
  };

  return (
    <div className="donation-history-container">
      <h2>Donation History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Previous Donation Date</th>
                <th>Next Eligible Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.length > 0 ? (
                donations.map((donation, index) => (
                  <tr key={index}>
                    <td>{donation.previousDonationDate ? donation.previousDonationDate.split("T")[0] : "No record"}</td>
                    <td>{donation.nextEligibleDate ? donation.nextEligibleDate.split("T")[0] : "Not available"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No donation history available</td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={handleUpdateDonation}>Update Last Donation</button>
          <button onClick={() => navigate("/donor-dashboard")}>Back to Dashboard</button>
        </>
      )}
    </div>
  );
};

export default DonorHistory;
