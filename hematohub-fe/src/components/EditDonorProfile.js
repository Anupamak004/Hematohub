import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditDonorProfile.css";

const EditDonorDashboard = () => {
  const storedDonorId = localStorage.getItem("donorId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  console.log(storedDonorId);
  console.log(token);
  console.log(localStorage.getItem("donorId"));


  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    weight: "",
    height: "",
    lastDonation: "",
    email: "",
  });

  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        if (!storedDonorId || !token) {
          alert("Authentication error. Please log in.");
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/donors/${storedDonorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch donor details");

        const donor = await response.json();
        setFormData({
          name: donor.name || "",
          mobile: donor.mobile || "",
          address: donor.address || "",
          weight: donor.weight || "",
          height: donor.height || "",
          lastDonation: donor.lastDonation || "",
          email: donor.email || "",
        });
      } catch (error) {
        console.error("Error fetching donor data:", error);
        alert("Failed to load donor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorDetails();
  }, [storedDonorId, token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/donors/${storedDonorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update donor details");

      alert("Profile updated successfully!");
      navigate("/donor-dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="edit-donor-dashboard">
      <h2>Edit Donor Profile</h2>
      <form onSubmit={handleSubmit}>
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Phone", name: "mobile", type: "text" },
          { label: "Address", name: "address", type: "text" },
          { label: "Weight", name: "weight", type: "number" },
          { label: "Height", name: "height", type: "number" },
          { label: "Last donation", name: "lastDonation", type: "date" },
          { label: "Email", name: "email", type: "email" },
        ].map(({ label, name, type }) => (
          <div className="input-group" key={name}>
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              
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

export default EditDonorDashboard;
