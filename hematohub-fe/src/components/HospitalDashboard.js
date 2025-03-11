import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdBloodtype, MdEmergency, MdHistory, MdNotifications, MdLocalHospital, MdLogout } from "react-icons/md";
import "./HospitalDashboard.css";
import { FaSignOutAlt, FaHistory, FaUser, FaEdit, FaBars, FaTimes } from "react-icons/fa";


const HospitalDashboard = () => {
  const [hospitalData, setHospitalData] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("bloodStock");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:5000/api/hospitals/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHospitalData(data);
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



  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        
    
        <div className="sidebar-content">
          <button className="sidebar-btn" onClick={() => setCurrentTab("bloodStock")}>
            <MdBloodtype className="icon-red" /> Blood Stock
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("bloodRequests")}>
            <MdEmergency className="icon-orange" /> Blood Requests
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("donationHistory")}>
            <MdHistory className="icon-purple" /> Donation History
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("notifications")}>
            <MdNotifications className="icon-blue" /> Notifications
          </button>
          <button className="sidebar-btn" onClick={() => setCurrentTab("hospitalInfo")}>
            <MdLocalHospital className="icon-blue" /> Hospital Info
          </button>
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <MdLogout className="icon-yellow" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <header>
          <h1>Welcome, {hospitalData?.hospitalName || "Hospital"} </h1>
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


        {currentTab === "bloodRequests" && (
          <section className="blood-requests glass-card">
            <h2>Blood Requests</h2>
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
                    </tr>
                  </thead>
                  <tbody>
                    {bloodRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.bloodType}</td>
                        <td>{request.quantity}</td>
                        <td>{request.urgency}</td>
                        <td>{request.status}</td>
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

        {currentTab === "hospitalInfo" && (
          <section className="hospital-info glass-card">
            <h2>Hospital Information</h2>
            <p><strong>Name:</strong> {hospitalData?.hospitalName || "Not Available"}</p>
            <p><strong>Email:</strong> {hospitalData?.email || "Not Available"}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
