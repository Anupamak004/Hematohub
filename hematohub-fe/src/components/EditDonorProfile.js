import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditDonorProfile.css";
import { FaSave, FaArrowLeft, FaExclamationCircle } from "react-icons/fa";

const EditDonorProfile = () => {
  const navigate = useNavigate();
  const donorData = JSON.parse(localStorage.getItem("donor")) || {};

  const [formData, setFormData] = useState({
    name: donorData.name || "",
    email: donorData.email || "",
    phone: donorData.phone || "",
    bloodType: donorData.bloodType || "",
    height: donorData.height || "",
    weight: donorData.weight || "",
    disease: donorData.disease || "No",
    medications: donorData.medications || "No",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Edit Profile | HematoHub";
  }, []);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Enter a valid email.";
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = "Phone number must be 10 digits.";
    if (!formData.bloodType.trim()) newErrors.bloodType = "Blood type is required.";
    if (formData.height < 100 || formData.height > 250) newErrors.height = "Enter a valid height (100-250 cm).";
    if (formData.weight < 30 || formData.weight > 200) newErrors.weight = "Enter a valid weight (30-200 kg).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    localStorage.setItem("donor", JSON.stringify(formData));
    alert("Profile updated successfully!");
    navigate("/donor-dashboard");
  };

  return (
    <div className="edit-profile-container">
      <button className="back-button" onClick={() => navigate("/donor-dashboard")}>
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h2>Edit Profile</h2>

      <div className="edit-form">
        {[
          { label: "Full Name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Blood Type", name: "bloodType", type: "text" },
          { label: "Height (cm)", name: "height", type: "number" },
          { label: "Weight (kg)", name: "weight", type: "number" },
        ].map(({ label, name, type }) => (
          <div key={name} className="input-group">
            <label>{label}:</label>
            <input type={type} name={name} value={formData[name]} onChange={handleInputChange} />
            {errors[name] && <span className="error-msg"><FaExclamationCircle /> {errors[name]}</span>}
          </div>
        ))}

        <div className="input-group">
          <label>Any Disease:</label>
          <select name="disease" value={formData.disease} onChange={handleInputChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="input-group">
          <label>Taking Medications:</label>
          <select name="medications" value={formData.medications} onChange={handleInputChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <button className="save-button" onClick={handleSave}>
          <FaSave /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditDonorProfile;
