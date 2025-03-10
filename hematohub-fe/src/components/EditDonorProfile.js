import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditDonorProfile.css";

const EditDonorProfile = ({ onSave }) => {
  const storedDonorId = localStorage.getItem("donorId"); 
  const { donorId: urlDonorId } = useParams();
  const donorId = urlDonorId || storedDonorId; 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        console.log("Donor ID:", donorId);
        console.log("Token:", token);
        
        if (!donorId || !token) {
          alert("Authentication error. Please log in.");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/donors/${donorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching data:", errorData);
          throw new Error(`Error fetching donor details: ${errorData.message}`);
        }

        const donor = await response.json();
        console.log("Fetched Donor Data:", donor);

        setFormData({
          name: donor.name || "",
          phone: donor.phone || "",
          alternatePhone: donor.alternatePhone || "",
          address: donor.address || "",
          city: donor.city || "",
          state: donor.state || "",
          zipCode: donor.zipCode || "",
          country: donor.country || "",
          email: donor.email || "",
          password: "", 
        });
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to load donor details.");
      } finally {
        setLoading(false);
      }
    };

    if (donorId) fetchDonorDetails();
  }, [donorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const updatedData = { ...formData };
      if (!updatedData.password) delete updatedData.password; 

      const response = await fetch(`http://localhost:5000/api/donors/${donorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update donor profile");

      onSave();
      alert("Profile updated successfully!");
      navigate("/donor-dashboard");
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Alternate Phone", name: "alternatePhone", type: "text" },
          { label: "Address", name: "address", type: "text" },
          { label: "City", name: "city", type: "text" },
          { label: "State", name: "state", type: "text" },
          { label: "ZIP Code", name: "zipCode", type: "text" },
          { label: "Country", name: "country", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "New Password (optional)", name: "password", type: "password" },
        ].map(({ label, name, type }) => (
          <div className="input-group" key={name}>
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              required={name !== "password"}
            />
          </div>
        ))}

        <div className="button-group">
          <button type="button" className="back-button" onClick={() => navigate("/donor-dashboard")}>
            Back
          </button>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDonorProfile;
