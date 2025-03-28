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
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const newDate = prompt(`Enter last donation date (YYYY-MM-DD) (Max: ${today}):`);
  
    if (!newDate) return;
  
    // Validate: Prevent future dates
    if (newDate > today) {
      alert("Error: Future dates are not allowed.");
      return;
    }
  
    if (donations.length > 0) {
      const lastDonationDate = new Date(donations.at(-1).previousDonationDate);
      const minNextDonationDate = new Date(lastDonationDate);
      minNextDonationDate.setDate(minNextDonationDate.getDate() + 90); // 3-month restriction
  
      // 🚫 Prevent entering a date before the last donation date
      if (new Date(newDate) < lastDonationDate) {
        alert(`Error: Donation date cannot be before your last recorded donation on ${lastDonationDate.toISOString().split("T")[0]}.`);
        return;
      }
  
      // 🚫 Enforce 3-month restriction
      if (new Date(newDate) < minNextDonationDate) {
        alert(`Error: You must wait at least 3 months (until ${minNextDonationDate.toISOString().split("T")[0]}) before donating again.`);
        return;
      }
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/donors/${donorId}/donations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastDonation: newDate }),
      });
  
      if (response.ok) {
        const updatedData = await response.json();
        setDonations([...donations, updatedData.donationHistory.at(-1)]); // Append last donation record
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
