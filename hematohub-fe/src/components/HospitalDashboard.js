import React, { useEffect, useState } from "react";
import { FaSignOutAlt, FaHistory, FaUser, FaEdit, FaBars, FaTimes } from "react-icons/fa";
import { MdLocalHospital, MdBloodtype, MdLogout, MdMenu, MdEmergency, MdHistory, MdNotifications } from "react-icons/md";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "./HospitalDashboard.css";
import { useNavigate } from "react-router-dom";

const HospitalDashboard = () => {
  const [hospitalData, setHospitalData] = useState(null);
  const navigate = useNavigate();
  const [bloodStock, setBloodStock] = useState([]);
  const [currentTab, setCurrentTab] = useState("bloodStock");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
useEffect(() => {
  const fetchBloodStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/hospitals/blood-stock", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blood stock data");
      }

      const data = await response.json();
      setBloodStock(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchBloodStock();
}, []);

  

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you store a JWT token
        const response = await fetch("http://localhost:5000/api/hospitals/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token for authentication
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data");
        }
  
        const data = await response.json();
        setHospitalData(data); // Update state with fetched data
      } catch (error) {
        console.error(error);
        alert("Error fetching hospital data, please log in again.");
        window.location.href = "/login";
      }
    };
  
    fetchHospitalData();
  }, []);
  
  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/hospitals/blood-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch blood requests");
        }
  
        const data = await response.json();
        setBloodRequests(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchBloodRequests();
  }, []);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/hospitals/notifications", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
  
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchNotifications();
  }, []);
  

  const chartData = {
    labels: bloodStock.map((stock) => stock.type),
    datasets: [
      {
        label: "Blood Stock",
        data: bloodStock.map((stock) => stock.units),
        backgroundColor: [
          "#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#e76f51", "#1d3557", "#f1faee", "#333333",
        ],
        hoverBackgroundColor: [
          "#d62828", "#1d3557", "#e76f51", "#219ebc", "#c0392b", "#16a085", "#d5dbdb", "#2c3e50",
        ],
      },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("hospital");
    window.location.href = "/login";
  };

  const handleSubmitRequest = async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const requestData = {
      bloodType: formData.get("bloodType"),
      quantity: formData.get("quantity"),
      urgency: formData.get("urgency"),
    };
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/hospitals/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit request");
      }
  
      alert("Blood request submitted successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error submitting request.");
    }
  };
  

  const handleCancelRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/hospitals/blood-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to cancel request");
      }
  
      alert("Blood request cancelled successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error cancelling request.");
    }
  };
  
const handleEmergencyMode = () => {
    console.log("Emergency mode activated");
    // Add logic for handling emergency mode
};

const navigateTo = (path) => {
  navigate(path);
  setSidebarOpen(false); // Close sidebar after navigating
};


  return (
    <div className="hospital_classname-container">
      <button className="hospital_classname-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <MdMenu />}
      </button>

      <div className={`hospital_classname-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="hospital_classname-sidebar-content">
          <button className="hospital_classname-sidebar-btn" onClick={() =>{ setCurrentTab("bloodStock"); setSidebarOpen(false);} }>
            <MdBloodtype className="icon-red" /> Blood Stock
          </button>
          <button className="hospital_classname-sidebar-btn" onClick={() => {setCurrentTab("bloodRequests");setSidebarOpen(false);}}>
            <MdEmergency className="icon-orange" /> Blood Requests
          </button>
          <button className="hospital_classname-sidebar-btn" onClick={() => {setCurrentTab("donationHistory");setSidebarOpen(false);}}>
            <MdHistory className="icon-purple" /> Donation History
          </button>
          <button className="hospital_classname-sidebar-btn" onClick={() => {setCurrentTab("notifications");setSidebarOpen(false);}}>
            <MdNotifications className="icon-blue" /> Notifications
          </button>
          <button className="hospital_classname-sidebar-btn" onClick={() => {setCurrentTab("hospitalInfo");setSidebarOpen(false);}}>
            <MdLocalHospital className="icon-blue" /> Hospital Info
          </button>
          <button className="hospital_classname-sidebar-btn hospital_classname-logout-btn" onClick={handleLogout}>
            <MdLogout className="icon-yellow" /> Logout
          </button>
        </div>
      </div>

      <div className="hospital_classname-content">
        <header>
          <h1>Welcome {hospitalData?.hospitalName || "Hospital"} </h1>
        </header>

        {currentTab === "bloodStock" && (
          <section className="hospital_classname-blood-stock-section">
            <h2>Blood Stock Overview</h2>
            <div className="hospital_classname-chart-container hospital_classname-glass-card">
              <Doughnut data={chartData} />
            </div>
          </section>
        )}

{currentTab === "bloodRequests" && (
          <section className="blood-requests glass-card">
            <h2>Blood Requests</h2>
            <div className="request-form">
              <h3>Submit New Request</h3>
              <form onSubmit={handleSubmitRequest}>
                <label>
                  Blood Type:
                  <select name="bloodType" required>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="O-">O-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </label>
                <label>
                  Quantity:
                  <input type="number" name="quantity" min="1" required />
                </label>
                <label>
                  Urgency:
                  <select name="urgency" required>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </label>
                <button type="submit">Submit Request</button>
              </form>
            </div>

            <div className="request-table">
              <h3>Existing Requests</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Blood Type</th>
                      <th>Quantity</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.bloodType}</td>
                        <td>{request.quantity}</td>
                        <td>{request.urgency}</td>
                        <td>{request.status}</td>
                        <td>
                          {request.status === "Pending" && (
                            <button onClick={() => handleCancelRequest(request.id)}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {currentTab === "donationHistory" && (
          <section className="donation-history glass-card">
            <h2>Donation History</h2>
            <div className="table-container">
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
                  {donationHistory.map((donation) => (
                    <tr key={donation.id}>
                      <td>{donation.donorName}</td>
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

        {currentTab === "emergencyMode" && (
          <section className="emergency-mode glass-card">
            <h2>Emergency Mode</h2>
            <p>Activate emergency mode to notify all donors and hospitals about urgent blood needs.</p>
            <button onClick={handleEmergencyMode}>Activate Emergency Mode</button>
          </section>
        )}

        {currentTab === "hospitalInfo" && (
          <section className="hospital-info glass-card">
            <h2>Hospital Information</h2>
            <p>
              <strong>Name:</strong> {hospitalData?.hospitalName || "Not Available"}
            </p>
            <p>
              <strong>Location:</strong> {hospitalData?.location || "Not Available"}
            </p>
            <p>
              <strong>Email:</strong> {hospitalData?.email || "Not Available"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;