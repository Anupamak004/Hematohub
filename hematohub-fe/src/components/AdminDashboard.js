import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [hospitals, setHospitals] = useState([]);
    const [donors, setDonors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        axios.get("http://localhost:5000/api/admin/hospitals", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHospitals(res.data))
            .catch(err => console.error("Error fetching hospitals", err));

        axios.get("http://localhost:5000/api/admin/donors", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setDonors(res.data))
            .catch(err => console.error("Error fetching donors", err));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/");
    };

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <h2 className="dashboard-title">Admin Dashboard</h2>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </header>

            <section className="dashboard-section">
                <h3 className="section-title">Hospitals</h3>
                <ul className="hospital-list">
                    {hospitals.map(hospital => (
                        <li key={hospital._id} className="hospital-item">
                            <span className="hospital-name">{hospital.name}</span>
                            <span className={`hospital-status ${hospital.status ? hospital.status.toLowerCase() : "unknown"}`}>
    {hospital.status || "Unknown"}
</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="dashboard-section">
                <h3 className="section-title">Donors</h3>
                <ul className="donor-list">
                    {donors.map(donor => (
                        <li key={donor._id} className="donor-item">
                            <span className="donor-name">{donor.name}</span>
                            <span className="donor-blood">{donor.bloodType}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default AdminDashboard;
