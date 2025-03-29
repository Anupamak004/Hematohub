import React, { useState, useEffect } from "react";
import "./BloodStock.css";

const BloodStock = () => {
  const [hospitals, setHospitals] = useState([]); // Stores all registered hospitals
  const [selectedHospital, setSelectedHospital] = useState(""); // Selected hospital name
  const [hospitalDetails, setHospitalDetails] = useState(null); // Selected hospital details

  useEffect(() => {
    // Fetch list of registered hospitals
    fetch("http://localhost:5000/api/hospitals/")
      .then((response) => response.json())
      .then((data) => setHospitals(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error fetching hospitals:", error));
  }, []);

  const handleSearch = () => {
    if (!selectedHospital) return; // Prevent empty search
    fetch(`http://localhost:5000/api/hospitals/${selectedHospital}`)
      .then((response) => response.json())
      .then((data) => setHospitalDetails(data))
      .catch(() => setHospitalDetails(null));
  };

  return (
    <div className="blood-stock-container">
      <h2>Search Blood Stock</h2>

      {/* Search Dropdown */}
      <div className="search-box">
        <select
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
        >
          <option value="">Select a hospital...</option>
          {hospitals.map((hospital) => (
            <option key={hospital._id} value={hospital.hospitalName}>
              {hospital.hospitalName}
            </option>
          ))}
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Selected Hospital Details */}
      {hospitalDetails && (
        <div className="hospital-details">
          <h3>{hospitalDetails.hospitalName}</h3>
          <p>
            <strong>Type:</strong> {hospitalDetails.hospitalType} <br />
            <strong>Address:</strong> {hospitalDetails.address}, {hospitalDetails.city}, {hospitalDetails.state} <br />
            <strong>Contact:</strong> {hospitalDetails.phoneNumber} <br />
            <strong>Email:</strong> {hospitalDetails.email} <br />
          </p>

          {hospitalDetails.bloodStock ? (
            <table>
              <thead>
                <tr>
                  <th>A+</th> <th>A-</th> <th>B+</th> <th>B-</th>
                  <th>O+</th> <th>O-</th> <th>AB+</th> <th>AB-</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{hospitalDetails.bloodStock["A+"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["A-"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["B+"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["B-"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["O+"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["O-"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["AB+"] || 0}</td>
                  <td>{hospitalDetails.bloodStock["AB-"] || 0}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No blood stock data available for this hospital.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BloodStock;
