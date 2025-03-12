import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
    
    const [hospitals, setHospitals] = useState([]);
    const [donors, setDonors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("donors");
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            throw new Error("No token received from the server");
        }
console.log("Admin Token:", token);

        axios.get("http://localhost:5000/api/admin/hospitals", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHospitals(res.data))
            .catch(err => console.error("Error fetching hospitals", err));

        axios.get("http://localhost:5000/api/admin/donors", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setDonors(res.data))
            .catch(err => console.error("Error fetching donors", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/login");
    };

    const handleDelete = async (id, type) => {
        const token = localStorage.getItem("adminToken");
        console.log("Admin Token before delete request:", token); // Debugging log
        console.log(id);
        if (!token) {
            console.error("No admin token found! Redirecting to login.");
            navigate("/login");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/admin/${type}/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            console.log("Response status:", response.status);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete user");
            }
    
            console.log("Delete successful");
    
            if (type === "donors") {
                setDonors(prevDonors => prevDonors.filter(donor => donor._id !== id));
            } else {
                setHospitals(prevHospitals => prevHospitals.filter(hospital => hospital._id !== id));
            }
        } catch (err) {
            console.error("Error deleting user:", err.message);
        }
    };
    
    

    const toggleDetails = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Function to calculate age from date of birth
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="admin-current">
            <aside className="admin-current-sidebar">
                <button onClick={() => setSelectedCategory("donors")} className={selectedCategory === "donors" ? "admin-current-active" : ""}>Donors</button>
                <button onClick={() => setSelectedCategory("hospitals")} className={selectedCategory === "hospitals" ? "admin-current-active" : ""}>Hospitals</button>
                <button onClick={handleLogout}>Logout</button>
            </aside>

            <div className="admin-current-content">
                {selectedCategory === "donors" ? (
                    <section>
                        <h3>Donors</h3>
                        <ul>
                            {donors.map(donor => (
                                <li key={donor._id} className={`admin-current-item ${expandedId === donor._id ? "expanded" : ""}`}>
                                    <div className="admin-current-info">
                                        <span><strong>Name :</strong>{donor.name} </span>
                                        <span><strong>Blood Group :</strong>{donor.bloodType}</span>
                                        <div>
                                            <button onClick={() => toggleDetails(donor._id)} className="admin-current-view">
                                                {expandedId === donor._id ? "Hide" : "View"}
                                            </button>
                                            <button onClick={() => handleDelete(donor._id, "donors")} className="admin-current-delete">Delete</button>
                                            
                                        </div>
                                    </div>
                                    {expandedId === donor._id && (
                                        <div className="admin-current-details">
                                            <p><strong>Age:</strong> {calculateAge(donor.dob)}</p>
                                            <p><strong>Contact:</strong> {donor.mobile}</p>
                                            <p><strong>Address:</strong> {donor.address}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : (
                    <section>
                        <h3>Hospitals</h3>
                        <ul>
                            {hospitals.map(hospital => (
                                <li key={hospital._id} className={`admin-current-item ${expandedId === hospital._id ? "expanded" : ""}`}>
                                    <div className="admin-current-info">
                                        <span><strong>Hospital Name :</strong>{hospital.hospitalName}</span>
                                        <div>
                                            <button onClick={() => toggleDetails(hospital._id)} className="admin-current-view">
                                                {expandedId === hospital._id ? "Hide" : "View"}
                                            </button>
                                            <button onClick={() => handleDelete(hospital._id, "hospitals")} className="admin-current-delete">Delete</button>
                                        </div>
                                    </div>
                                    {expandedId === hospital._id && (
                                        <div className="admin-current-details">
                                            <p><strong>Registration No:</strong> {hospital.registrationNumber}</p>
                                            <p><strong>Phone:</strong> {hospital.phoneNumber}</p>
                                            <p><strong>City:</strong> {hospital.city}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
