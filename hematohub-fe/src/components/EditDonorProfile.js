import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditDonorProfile.css";

const EditDonorDashboard = () => {
  const storedDonorId = localStorage.getItem("donorId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    address: "",
    weight: "",
    height: "",
    bloodType: "",
    hasDisease: null,
    aadhar: "",
    mobile: "",
    medications: null,
    email: "",
  });

  useEffect(() => {
    const fetchDonorDetails = async () => {
      if (!storedDonorId || !token) {
        alert("Authentication error. Please log in.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/donors/${storedDonorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch donor details");

        const donor = await response.json();
        setFormData({
          ...donor,
          dob: donor.dob ? donor.dob.split("T")[0] : "",
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
    const { name, value, type } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.medications === null) {
      alert("Please select if you are taking any medications.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/donors/${storedDonorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

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
      <form onSubmit={handleSubmit} className="edit-donor-form">
        {[{ label: "Name", name: "name", type: "text" },
          { label: "Address", name: "address", type: "text" },
          { label: "Weight (kg)", name: "weight", type: "number" },
          { label: "Height (cm)", name: "height", type: "number" },
          { label: "Mobile Number", name: "mobile", type: "text" },
          { label: "Email", name: "email", type: "email" },
        ].map(({ label, name, type }) => (
          <div className="form-group" key={name}>
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        {/* Disease Question */}
        <div className="form-group">
          <label>Do you have any disease?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="hasDisease"
                value="true"
                checked={formData.hasDisease === true}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hasDisease"
                value="false"
                checked={formData.hasDisease === false}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        {/* Medication Question */}
        <div className="form-group">
          <label>Are you taking any medications?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="medications"
                value="true"
                checked={formData.medications === true}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="medications"
                value="false"
                checked={formData.medications === false}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

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
