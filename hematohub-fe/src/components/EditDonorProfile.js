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
    disease: "",
    aadhar: "",
    mobile: "",
    medications: null,
    emergency: false,
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
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
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
        {/* Basic Fields */}
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
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
          <label>
            Do you have any disease? <span className="required">*</span>
          </label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="hasDisease"
                value="true"
                checked={formData.hasDisease === true}
                onChange={() => setFormData({ ...formData, hasDisease: true })}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hasDisease"
                value="false"
                checked={formData.hasDisease === false}
                onChange={() =>
                  setFormData({ ...formData, hasDisease: false, disease: "" })
                }
              />
              No
            </label>
          </div>
        </div>

        {/* Disease Details */}
        {formData.hasDisease === true && (
          <div className="form-group">
            <label>If yes, specify disease:</label>
            <input
              type="text"
              name="disease"
              value={formData.disease}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Medication Question */}
        <div className="form-group">
          <label>
            Are you taking any medications? <span className="required">*</span>
          </label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="medications"
                value="true"
                checked={formData.medications === true}
                onChange={() => setFormData({ ...formData, medications: true })}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="medications"
                value="false"
                checked={formData.medications === false}
                onChange={() =>
                  setFormData({ ...formData, medications: false, medicationDetails: "" })
                }
              />
              No
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="button-group">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/donor-dashboard")}
          >
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
