import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { 
  MdMenu, MdBloodtype, MdEmergency, MdHistory, MdNotifications, MdLocalHospital, MdLogout, MdDone, MdMoveToInbox 
} from "react-icons/md";
import { FaBars, FaTimes } from "react-icons/fa";
import "./HospitalDashboard.css";
import axios from "axios";



const HospitalDashboard = () => {
  const [hospitalData, setHospitalData] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [donatedBlood, setDonatedBlood] = useState([]);
  const [receivedBlood, setReceivedBlood] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("bloodStock");
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState([]);
const [bloodType, setBloodType] = useState("");
const [date, setDate] = useState("");
const [units, setUnits] = useState("");
const [receivedFrom, setReceivedFrom] = useState("");
const [receivedBloodType, setReceivedBloodType] = useState("");
const [receivedDate, setReceivedDate] = useState("");
const [receivedUnits, setReceivedUnits] = useState("");
const [urgentBloodType, setUrgentBloodType] = useState("");
  const [urgentUnits, setUrgentUnits] = useState("");
  const [message, setMessage] = useState("");
  

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] || [];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:5000/api/hospitals/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHospitalData(data);
        setBloodRequests(data.bloodRequests || []);
        setDonationHistory(data.donationHistory || []);
        setDonatedBlood(data.donatedBlood || []);
        setReceivedBlood(data.receivedBlood || []);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const updateBloodStock = (bloodType, change) => {
    setHospitalData((prevData) => ({
      ...prevData,
      bloodStock: {
        ...prevData.bloodStock,
        [bloodType]: (prevData.bloodStock[bloodType] || 0) + change,
      },
    }));
  };

  const requestUrgentBlood = async () => {
    if (!urgentBloodType || !urgentUnits) {
      setMessage("Please select a blood type and enter the required units.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/hospitals/blood-requests", {
        hospitalId: hospitalData._id,
        bloodType: urgentBloodType,
        units: urgentUnits,
      });

      setMessage(response.data.message || "Urgent blood request sent successfully.");
    } catch (error) {
      setMessage(error.response?.data?.error || "No Donor to send urgent blood request.");
    }
  };
  


  const fetchHospitalData = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("http://localhost:5000/api/hospitals/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHospitalData(data);
      setBloodRequests(data.bloodRequests || []);
      setDonationHistory(data.donationHistory || []);
      setDonatedBlood(data.donatedBlood || []);
      setReceivedBlood(data.receivedBlood || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    }
  };
  

  const fetchDonatedBlood = async () => {
    if (!hospitalData || !hospitalData._id) return;
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipients/donated-blood/${hospitalData._id}`
      );
      const data = await response.json();
  
      // Update the state with the latest donation data
      setDonatedBlood(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching donated blood data:", error);
      setDonatedBlood([]);
    }
  };


  const fetchReceivedBlood = async () => {
    if (!hospitalData || !hospitalData._id) return;
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipients/received-blood/${hospitalData._id}`
      );
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Fetched Received Blood Data:", data); // Debugging
  
      setReceivedBlood(Array.isArray(data.receivedBloodEntries) ? data.receivedBloodEntries : []);
    } catch (error) {
      console.error("Error fetching received blood data:", error);
      setReceivedBlood([]);
    }
  };
  
  
  


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalData || !hospitalData._id) {
      alert("Hospital data is missing. Please refresh the page.");
      return;
    }

    const newDonation = {
      recipientName,
      bloodType,
      date,
      units: Number(units),
      hospitalId: hospitalData._id, // Ensure hospital ID is used correctly
    };

    try {
      const response = await fetch("http://localhost:5000/api/recipients/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDonation),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Donation successfully added");
        console.log("Donation successfully added");
        setDonatedBlood((prev) => [...prev, data.donation]); // Update state properly
        fetchDonatedBlood();
        setRecipientName("");
        setBloodType("");
        setDate("");
        setUnits("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  useEffect(() => {
    const fetchDonatedBlood = async () => {
      if (!hospitalData || !hospitalData._id) return; // Prevent API call if hospitalData is missing

      try {
        const response = await fetch(
          `http://localhost:5000/api/recipients/donated-blood/${hospitalData._id}`
        );
        const data = await response.json();
         
        console.log("Fetched Donated Blood Data:", data); // Debugging step

      if (Array.isArray(data)) {
        setDonatedBlood(data);
      } else {
        setDonatedBlood([]); // Ensure it's always an array
      }
      } catch (error) {
        console.error("Error fetching donated blood data:", error);
        setDonatedBlood([]);
      }
    };

    fetchDonatedBlood();
  }, [hospitalData]);
  


  const handleReceivedSubmit = async (e) => {
    e.preventDefault();
  
    if (!hospitalData || !hospitalData._id) {
      alert("Hospital data is missing. Please refresh the page.");
      return;
    }
  
    const newReceivedBlood = {
      receivedFrom,
      bloodType : receivedBloodType,
      receivedDate,
      units: Number(receivedUnits),
      hospitalId: hospitalData._id,
    };
  
    console.log(receivedFrom,bloodType,receivedDate,units,hospitalData);
    try {
      const response = await fetch("http://localhost:5000/api/recipients/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReceivedBlood),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Received blood successfully added");
        console.log("Received blood successfully added");
        setReceivedBlood((prev) => [...prev, data.receivedBlood]); // Update state
        fetchReceivedBlood();
        setReceivedFrom("");
        setReceivedBloodType("");
        setReceivedDate("");
        setReceivedUnits("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  useEffect(() => {
    fetchReceivedBlood();
  }, [hospitalData]);
  


  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
        <button className="sidebar-btn" onClick={() => setCurrentTab("hospitalInfo")}>
            <MdLocalHospital className="icon-blue" /> Hospital Info
          </button>
          <button className="sidebar-btn" onClick={() => {
    setCurrentTab("bloodStock"); 
    fetchHospitalData(); // Fetch latest data
  }}>
            <MdBloodtype className="icon-red" /> Blood Stock
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("bloodRequests")}>
            <MdEmergency className="icon-orange" /> Blood Requests
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("donationHistory")}>
            <MdHistory className="icon-purple" /> Donation History
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("receivedBlood")}>
            <MdMoveToInbox className="icon-blue" /> Donor Information
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("donatedBlood")}>
            <MdDone className="icon-green" /> Recipient Information
          </button>
          {/*<button className="sidebar-btn" onClick={() => setCurrentTab("notifications")}>
            <MdNotifications className="icon-blue" /> Notifications
          </button>*/}
          
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <MdLogout className="icon-yellow" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <header>
          <h1><strong>WELCOME  {hospitalData?.hospitalName || "Hospital"}</strong></h1>
        </header>

        {currentTab === "bloodStock" && (
  <section className="blood-stock-page">
    {/* Header Section */}
    <header className="blood-stock-header">
      <h2>Blood Stock Overview</h2>
    </header>

    {/* Main Content */}
    <div className="blood-stock-content">
      {/* Blood Stock Summary Table */}
      <div className="blood-summary glass-card">
        <h3>Current Blood Stock</h3>
        {hospitalData?.bloodStock && Object.keys(hospitalData.bloodStock).length > 0 ? (
          <table className="blood-stock-table">
            <thead>
              <tr>
                <th>Blood Type</th>
                <th>Available Units</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hospitalData.bloodStock).map(([bloodType, units]) => (
                <tr key={bloodType}>
                  <td>{bloodType}</td>
                  <td>{units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">No blood stock data available.</p>
        )}
      </div>

      {/* Blood Stock Doughnut Chart */}
      <div className="blood-chart glass-card">
        <h3>Stock Distribution</h3>
        {hospitalData?.bloodStock && Object.keys(hospitalData.bloodStock).length > 0 ? (
          <div className="chart-wrapper">
            <Doughnut
              data={{
                labels: Object.keys(hospitalData.bloodStock),
                datasets: [
                  {
                    data: Object.values(hospitalData.bloodStock),
                    backgroundColor: ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#8d99ae", "#ffb703", "#6a0572", "#264653"],
                    borderWidth: 1.5,
                    hoverBorderColor: "#ffffff",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#333",
                      font: { size: 14, weight: "bold" },
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="no-data-message">No stock data available for visualization.</p>
        )}
      </div>
    </div>
  </section>
)}
     
        


{currentTab === "donatedBlood" && (
  <section className="donated-blood glass-card">
    <h2>Issued Blood</h2>

    {/* Form for Adding New Donation */}
    <div className="donation-form glass-card">
      <h3>Add Issued Blood Entry</h3>
      <form
        onSubmit={handleSubmit}
      >
        <label>Recipient Name:</label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
        />

        <label>Blood Type:</label>
        <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} required>
          <option value="">Select Blood Type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Units:</label>
        <input type="number" value={units} onChange={(e) => setUnits(e.target.value)} required />

        <button type="submit">Add Donation</button>
      </form>
    </div>

    {/* Summary Table */}
    <div className="summary-table glass-card">
  <h3>Issued Blood Summary</h3>
  <table>
    <thead>
      <tr>
        <th>Blood Type</th>
        <th>Total Units Donated</th>
      </tr>
    </thead>
    <tbody>
    {donatedBlood && donatedBlood.length > 0 ? (
        Object.entries(
          donatedBlood.reduce((acc, donation) => {
            if (donation && donation.bloodType) { // Ensure donation is valid
              acc[donation.bloodType] = (acc[donation.bloodType] || 0) + donation.units;
            }
            return acc;
          }, {})
        ).map(([bloodType, totalUnits]) => (
          <tr key={bloodType}>
            <td>{bloodType}</td>
            <td>{totalUnits}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="2">No donation data available.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

    {/* Detailed Donation History */}
    <div className="table-container">
  <h3>Recipient Details</h3>
  <table>
    <thead>
      <tr>
        <th>Recipient Name</th>
        <th>Blood Type</th>
        <th>Issued Date</th>
        <th>Units</th>
      </tr>
    </thead>
    <tbody>
  {Array.isArray(donatedBlood) && donatedBlood.length > 0 ? (
    donatedBlood
      .filter((donation) => donation && donation.recipientName) // Ensure it's valid
      .map((donation, index) => (
        <tr key={index}>
          <td>{donation.recipientName || "Unknown"}</td>
          <td>{donation.bloodType || "Unknown"}</td>
          <td>{donation.date ? new Date(donation.date).toLocaleDateString("en-US") : "Unknown"}</td>
          <td>{donation.units || 0}</td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="3">No donation data available.</td>
    </tr>
  )}
</tbody>
  </table>
</div>
  </section>
)}



{currentTab === "receivedBlood" && (
  <section className="received-blood glass-card">
    <h2>Received Blood</h2>

    {/* Form for Adding Received Blood */}
    <div className="donation-form glass-card">
      <h3>Add Received Blood Entry</h3>
      <form onSubmit={handleReceivedSubmit}>
        <label>Donor Name:</label>
        <input
          type="text"
          value={receivedFrom}
          onChange={(e) => setReceivedFrom(e.target.value)}
          required
        />

        <label>Blood Type:</label>
        <select value={receivedBloodType} onChange={(e) => setReceivedBloodType(e.target.value)} required>
          <option value="">Select Blood Type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <label>Received Date:</label>
        <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} required />

        <label>Units:</label>
        <input type="number" value={receivedUnits} onChange={(e) => setReceivedUnits(e.target.value)} required />

        <button type="submit">Add Received Blood</button>
      </form>
    </div>

    {/* Summary Table */}
    <div className="summary-table glass-card">
      <h3>Received Blood Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Blood Type</th>
            <th>Total Units Received</th>
          </tr>
        </thead>
        <tbody>
          {receivedBlood && receivedBlood.length > 0 ? (
            Object.entries(
              receivedBlood.reduce((acc, entry) => {
                if (entry && entry.bloodType) { // Ensure entry is valid
                  acc[entry.bloodType] = (acc[entry.bloodType] || 0) + entry.units;
                }
                return acc;
              }, {})
            ).map(([bloodType, totalUnits]) => (
              <tr key={bloodType}>
                <td>{bloodType}</td>
                <td>{totalUnits}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No received blood data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Detailed Received Blood History */}
    <div className="table-container">
      <h3>Donor Details</h3>
      <table>
        <thead>
          <tr>
            <th>Donor Name</th>
            <th>Blood Type</th>
            <th>Date</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(receivedBlood) && receivedBlood.length > 0 ? (
            receivedBlood
              .filter((entry) => entry && entry.receivedFrom) // Ensure it's valid
              .map((entry, index) => (
                <tr key={index}>
                  <td>{entry.receivedFrom || "Unknown"}</td>
                  <td>{entry.bloodType || "Unknown"}</td>
                  <td>{entry.receivedDate ? new Date(entry.receivedDate).toLocaleDateString("en-US") : "Unknown"}</td>
                  <td>{entry.units || 0}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="3">No received blood data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
)}



        {currentTab === "notifications" && (
          <section className="notifications glass-card">
            <h2>Notifications</h2>
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <strong>{notification.date}</strong>: {notification.message}
                </li>
              ))}
            </ul>
          </section>
        )}

{currentTab === "hospitalInfo" && (
  <section className="hospital-info glass-card">
    <h2 className="section-title">Hospital Information</h2>
    
    <div className="info-grid">
      {/* General Information */}
      <div className="info-group">
        <h3>General Details</h3>
        <p><strong>Name:</strong> {hospitalData?.hospitalName || "Not Available"}</p>
        <p><strong>Registration No:</strong> {hospitalData?.registrationNumber || "Not Available"}</p>
        <p><strong>Type:</strong> {hospitalData?.hospitalType || "Not Available"}</p>
      </div>

      {/* Contact Information */}
      <div className="info-group">
        <h3>Contact Information</h3>
        <p><strong>Phone:</strong> {hospitalData?.phoneNumber || "Not Available"}</p>
        <p><strong>Alternate Phone:</strong> {hospitalData?.alternatePhone || "Not Available"}</p>
        <p><strong>Email:</strong> {hospitalData?.email || "Not Available"}</p>
      </div>

      {/* Location Details */}
      <div className="info-group">
        <h3>Location</h3>
        <p><strong>Address:</strong> {hospitalData?.address || "Not Available"}</p>
        <p><strong>City:</strong> {hospitalData?.city || "Not Available"}</p>
        <p><strong>State:</strong> {hospitalData?.state || "Not Available"}</p>
        <p><strong>ZIP Code:</strong> {hospitalData?.zip || "Not Available"}</p>
        <p><strong>Country:</strong> {hospitalData?.country || "Not Available"}</p>
      </div>

      {/* Licensing Information */}
      <div className="info-group">
        <h3>Licensing</h3>
        <p><strong>License Number:</strong> {hospitalData?.licenseNumber || "Not Available"}</p>
      </div>
    </div>
  </section>
)}



{currentTab === "bloodRequests" && (
  <section className="urgent-request glass-card">
  <h2>Request Urgent Blood</h2>

  <div className="form-group">
    <label htmlFor="bloodType">Select Blood Type:</label>
    <select
      id="bloodType"
      value={urgentBloodType}
      onChange={(e) => setUrgentBloodType(e.target.value)}
      required
    >
      <option value="">Select Blood Type</option>
      <option value="ALL">All Blood Types</option>
      {bloodTypes.map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label htmlFor="units">Units Required:</label>
    <input
      id="units"
      type="number"
      min="1"
      value={urgentUnits}
      onChange={(e) => setUrgentUnits(e.target.value)}
      required
    />
  </div>

  <button className="primary-button" onClick={() => requestUrgentBlood(urgentBloodType, urgentUnits)}>
    Send Urgent Request
  </button>

  {message && <p className="status-message">{message}</p>}
</section>
)}

      </div>
    </div>
  );
};

export default HospitalDashboard;