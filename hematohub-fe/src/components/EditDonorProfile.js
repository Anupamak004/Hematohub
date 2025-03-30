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
    takesMedication: null, // Changed to boolean
    emergency: false,
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
          name: donor.name || "",
          dob: donor.dob ? donor.dob.split("T")[0] : "",
          gender: donor.gender || "",
          address: donor.address || "",
          weight: donor.weight || "",
          height: donor.height || "",
          bloodType: donor.bloodType || "",
          hasDisease: donor.hasDisease !== null ? donor.hasDisease : null,
          disease: donor.disease || "",
          aadhar: donor.aadhar || "",
          mobile: donor.mobile || "",
          takesMedication: donor.takesMedication !== null ? donor.takesMedication : null,
          medicationDetails: donor.medicationDetails || "",
          emergency: donor.emergency || false,
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.takesMedication === null) {
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
      <form onSubmit={handleSubmit}>
        {/* Basic Fields */}
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Gender", name: "gender", type: "text" },
          { label: "Address", name: "address", type: "text" },
          { label: "Weight (kg)", name: "weight", type: "number" },
          { label: "Height (cm)", name: "height", type: "number" },
          { label: "Blood Type", name: "bloodType", type: "text" },
          { label: "Aadhar Number", name: "aadhar", type: "text" },
          { label: "Mobile Number", name: "mobile", type: "text" },
          { label: "Email", name: "email", type: "email" },
        ].map(({ label, name, type }) => (
          <div className="input-group" key={name}>
            <label>{label}:</label>
            <input type={type} name={name} value={formData[name] || ""} onChange={handleChange} />
          </div>
        ))}

        {/* Do you have any disease? */}
        <div className="input-group">
          <label>Do you have any disease? <span className="required">*</span></label>
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
                onChange={() => setFormData({ ...formData, hasDisease: false, disease: "" })}
              />
              No
            </label>
          </div>
        </div>

        {/* If has disease, show input */}
        {formData.hasDisease === true && (
          <div className="input-group">
            <label>If yes, specify disease:</label>
            <input type="text" name="disease" value={formData.disease} onChange={handleChange} />
          </div>
        )}

        {/* Are you taking any medications? */}
        <div className="input-group">
          <label>Are you taking any medications? <span className="required">*</span></label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="takesMedication"
                value="true"
                checked={formData.takesMedication === true}
                onChange={() => setFormData({ ...formData, takesMedication: true })}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="takesMedication"
                value="false"
                checked={formData.takesMedication === false}
                onChange={() => setFormData({ ...formData, takesMedication: false, medicationDetails: "" })}
                required
              />
              No
            </label>
          </div>
        </div>

        {/* If taking medication, show input */}
        {formData.takesMedication === true && (
          <div className="input-group">
            <label>If yes, specify medication:</label>
            <input type="text" name="medicationDetails" value={formData.medicationDetails} onChange={handleChange} />
          </div>
        )}

        {/* Submit Button */}
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
