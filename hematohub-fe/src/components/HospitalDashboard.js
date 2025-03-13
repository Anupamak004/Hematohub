import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { 
  MdMenu, MdBloodtype, MdEmergency, MdHistory, MdNotifications, MdLocalHospital, MdLogout, MdDone, MdMoveToInbox 
} from "react-icons/md";
import { FaBars, FaTimes } from "react-icons/fa";
import "./HospitalDashboard.css";


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
  const [recipientName, setRecipientName] = useState("");
const [bloodType, setBloodType] = useState("");
const [date, setDate] = useState("");
const [units, setUnits] = useState("");
const [receivedFrom, setReceivedFrom] = useState("");
const [receivedBloodType, setReceivedBloodType] = useState("");
const [receivedDate, setReceivedDate] = useState("");
const [receivedUnits, setReceivedUnits] = useState("");



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
    navigate("/login");
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
  

  const handleSubmitDonated = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("http://localhost:5000/api/blood/donated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientName, bloodType, date, units }),
      });
  
      if (res.ok) {
        alert("Blood donation recorded successfully!");
        updateBloodStock(bloodType, -Number(units)); // Reduce stock
        setRecipientName("");
        setBloodType("");
        setDate("");
        setUnits("");
      } else {
        alert("Error submitting donation.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting donation.");
    }
  };
  
  
  const handleSubmitReceived = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("http://localhost:5000/api/blood/received", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receivedFrom, receivedBloodType, receivedDate, receivedUnits }),
      });
  
      if (res.ok) {
        alert("Blood received recorded successfully!");
        updateBloodStock(receivedBloodType, Number(receivedUnits)); // Increase stock
        setReceivedFrom("");
        setReceivedBloodType("");
        setReceivedDate("");
        setReceivedUnits("");
      } else {
        alert("Error submitting received blood.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting received blood.");
    }
  };
  
  

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
          <button className="sidebar-btn" onClick={() => setCurrentTab("bloodStock")}>
            <MdBloodtype className="icon-red" /> Blood Stock
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("bloodRequests")}>
            <MdEmergency className="icon-orange" /> Blood Requests
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("donationHistory")}>
            <MdHistory className="icon-purple" /> Donation History
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("donatedBlood")}>
            <MdDone className="icon-green" /> Donated Blood
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("receivedBlood")}>
            <MdMoveToInbox className="icon-blue" /> Received Blood
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("notifications")}>
            <MdNotifications className="icon-blue" /> Notifications
          </button>
          
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <MdLogout className="icon-yellow" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <header>
          <h1><strong>WELCOME, {hospitalData?.hospitalName || "Hospital"}</strong></h1>
        </header>

        {currentTab === "bloodStock" && (
          <section className="blood-stock-section">
            <h2>Blood Stock Overview</h2>
            <div className="chart-container glass-card">
              <Doughnut
                data={{
                  labels: hospitalData?.bloodStock ? Object.keys(hospitalData.bloodStock) : [],
                  datasets: [
                    {
                      data: hospitalData?.bloodStock ? Object.values(hospitalData.bloodStock) : [],
                      backgroundColor: ["#e63946", "#457b9d", "#f4a261", "#2a9d8f"],
                    },
                  ],
                }}
              />
            </div>
          </section>
        )}

{currentTab === "donatedBlood" && (
  <section className="donated-blood glass-card">
    <h2>Donated Blood</h2>

    {/* Form for Adding New Donation */}
    <div className="donation-form glass-card">
      <h3>Add New Donation</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newDonation = {
            id: Date.now(), // Temporary unique ID
            recipientName,
            bloodType,
            date,
            units: Number(units),
          };
          setDonatedBlood([...donatedBlood, newDonation]); // Update state
          setRecipientName(""); // Reset fields
          setBloodType("");
          setDate("");
          setUnits("");
        }}
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
      <h3>Donation Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Blood Type</th>
            <th>Total Units Donated</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(
            donatedBlood.reduce((acc, donation) => {
              acc[donation.bloodType] = (acc[donation.bloodType] || 0) + donation.units;
              return acc;
            }, {})
          ).map(([bloodType, totalUnits]) => (
            <tr key={bloodType}>
              <td>{bloodType}</td>
              <td>{totalUnits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Detailed Donation History */}
    <div className="table-container">
      <h3>Donation Details</h3>
      <table>
        <thead>
          <tr>
            <th>Recipient Name</th>
            <th>Blood Type</th>
            <th>Date</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {donatedBlood.map((donation) => (
            <tr key={donation.id}>
              <td>{donation.recipientName}</td>
              <td>{donation.bloodType}</td>
              <td>{donation.date}</td>
              <td>{donation.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}



{currentTab === "receivedBlood" && (
  <section className="received-blood glass-card">
    <h2>Received Blood</h2>

    {/* Form for Adding New Received Blood Entry */}
    <div className="donation-form glass-card">
      <h3>Add New Received Blood Entry</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newReceivedBlood = {
            id: Date.now(), // Temporary unique ID
            receivedFrom,
            bloodType: receivedBloodType,
            date: receivedDate,
            units: Number(receivedUnits),
          };
          setReceivedBlood([...receivedBlood, newReceivedBlood]); // Update state
          setReceivedFrom(""); // Reset fields
          setReceivedBloodType("");
          setReceivedDate("");
          setReceivedUnits("");
        }}
      >
        <label>Received From:</label>
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

        <label>Date:</label>
        <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} required />

        <label>Units:</label>
        <input type="number" value={receivedUnits} onChange={(e) => setReceivedUnits(e.target.value)} required />

        <button type="submit">Add Received Blood</button>
      </form>
    </div>

    {/* Summary Table */}
    <div className="summary-table glass-card">
      <h3>Blood Received Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Blood Type</th>
            <th>Total Units Received</th>
            <th>Last Received Date</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(
            receivedBlood.reduce((acc, received) => {
              if (!acc[received.bloodType]) {
                acc[received.bloodType] = { totalUnits: 0, lastDate: received.date };
              }
              acc[received.bloodType].totalUnits += received.units;
              if (new Date(received.date) > new Date(acc[received.bloodType].lastDate)) {
                acc[received.bloodType].lastDate = received.date;
              }
              return acc;
            }, {})
          ).map(([bloodType, data]) => (
            <tr key={bloodType}>
              <td>{bloodType}</td>
              <td>{data.totalUnits}</td>
              <td>{data.lastDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Detailed Table */}
    <div className="table-container">
      <h3>Detailed Blood Received History</h3>
      <table>
        <thead>
          <tr>
            <th>Received From</th>
            <th>Blood Type</th>
            <th>Date</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {receivedBlood.map((received) => (
            <tr key={received.id}>
              <td>{received.receivedFrom}</td>
              <td>{received.bloodType}</td>
              <td>{received.date}</td>
              <td>{received.units}</td>
            </tr>
          ))}
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
    <h2>Hospital Information</h2>
    <p><strong>Name:</strong> {hospitalData?.hospitalName || "Not Available"}</p>
    <p><strong>Registration Number:</strong> {hospitalData?.registrationNumber || "Not Available"}</p>
    <p><strong>Type:</strong> {hospitalData?.hospitalType || "Not Available"}</p>
    <p><strong>Phone:</strong> {hospitalData?.phoneNumber || "Not Available"}</p>
    <p><strong>Alternate Phone:</strong> {hospitalData?.alternatePhone || "Not Available"}</p>
    <p><strong>Email:</strong> {hospitalData?.email || "Not Available"}</p>
    <p><strong>Address:</strong> {hospitalData?.address || "Not Available"}</p>
    <p><strong>City:</strong> {hospitalData?.city || "Not Available"}</p>
    <p><strong>State:</strong> {hospitalData?.state || "Not Available"}</p>
    <p><strong>ZIP Code:</strong> {hospitalData?.zip || "Not Available"}</p>
    <p><strong>Country:</strong> {hospitalData?.country || "Not Available"}</p>
    <p><strong>License Number:</strong> {hospitalData?.licenseNumber || "Not Available"}</p>
    
  </section>
)}

      </div>
    </div>
  );
};

export default HospitalDashboard;