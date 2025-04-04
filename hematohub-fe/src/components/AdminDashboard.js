import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import useAutoLogout from "../utils/auth";


function AdminDashboard() {
    useAutoLogout(); // Auto logout when token expires

    const [hospitals, setHospitals] = useState([]);
    const [donors, setDonors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("donors");
    const [expandedId, setExpandedId] = useState(null);
    const [message, setMessage] = useState("");
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
        navigate("/");
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
            return;
        }
        const token = localStorage.getItem("adminToken");
        console.log("Admin Token before delete request:", token); // Debugging log
        console.log(id);
        if (!token) {
            console.error("No admin token found! Redirecting to login.");
            navigate("/");
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
            alert("Record deleted successfully!");
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
                <button onClick={() => setSelectedCategory("donors")} className={selectedCategory === "donors" ? "admin-current-active" : ""}><strong>Donors</strong></button>
                <button onClick={() => setSelectedCategory("hospitals")} className={selectedCategory === "hospitals" ? "admin-current-active" : ""}><strong>Hospitals</strong></button>
                <button onClick={handleLogout}><strong>Logout</strong></button>
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
                <p><strong>Gender:</strong> {donor.gender}</p>
                <p><strong>Contact:</strong> {donor.mobile}</p>
                <p><strong>Email:</strong> {donor.email}</p>
                <p><strong>Address:</strong> {donor.address}</p>
                <p><strong>Weight:</strong> {donor.weight} kg</p>
                <p><strong>Height:</strong> {donor.height} cm</p>
                <p><strong>Has Disease:</strong> {donor.hasDisease ? "Yes" : "No"}</p>
                {donor.hasDisease && <p><strong>Disease:</strong> {donor.disease}</p>}
                <p><strong>Aadhar:</strong> {donor.aadhar}</p>
                <p><strong>Last Donation:</strong> {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : "Never"}</p>
                <p><strong>Medications:</strong> {donor.medications || "None"}</p>
                <p><strong>Emergency:</strong> {donor.emergency ? "Yes" : "No"}</p>

                {/* Display Latest Eligible Date */}
                {donor.donationHistory.length > 0 && (
                    <p><strong>Next Eligible Date:</strong> {new Date(donor.donationHistory[donor.donationHistory.length - 1].nextEligibleDate).toLocaleDateString()}</p>
                )}

                <h3>Donation History</h3>
                {donor.donationHistory.length > 0 ? (
                    <table className="donation-history-table">
                        <thead>
                            <tr>
                                <th>Previous Donation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donor.donationHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td>{new Date(entry.previousDonationDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No donation history available.</p>
                )}
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
                    <span><strong>Hospital Name:</strong> {hospital.hospitalName}</span>
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
                        <p><strong>Hospital Type:</strong> {hospital.hospitalType}</p>
                        <p><strong>Phone:</strong> {hospital.phoneNumber}</p>
                        {hospital.alternatePhone && <p><strong>Alternate Phone:</strong> {hospital.alternatePhone}</p>}
                        <p><strong>Address:</strong> {hospital.address}, {hospital.city}, {hospital.state}, {hospital.zip}, {hospital.country}</p>
                        {hospital.latitude && hospital.longitude && (
                            <p><strong>Location:</strong> {hospital.latitude}, {hospital.longitude}</p>
                        )}
                        <p><strong>License Number:</strong> {hospital.licenseNumber}</p>
                        {hospital.website && <p><strong>Website:</strong> <a href={hospital.website} target="_blank" rel="noopener noreferrer">{hospital.website}</a></p>}
                        {hospital.operatingHours && <p><strong>Operating Hours:</strong> {hospital.operatingHours}</p>}
                        <p><strong>Email:</strong> {hospital.email}</p>
                        <h4>Blood Stock</h4>
                        <ul>
                            {Object.entries(hospital.bloodStock).map(([bloodType, count]) => (
                                <li key={bloodType}><strong>{bloodType}:</strong> {count} units</li>
                            ))}
                        </ul>
                        
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
