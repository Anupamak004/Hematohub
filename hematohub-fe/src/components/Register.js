import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Register.css";
import registerImage from "../assets/blooddonation2.png";
import registerImage1 from "../assets/blooddonation3.png";
import registerImage3 from "../assets/blooddonation4.png";


const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(searchParams.get("type") || "donor");  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [weight, setWeight] = useState("");
  const [hasDisease, setHasDisease] = useState(false);
  const [disease, setDisease] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [mobile, setMobile] = useState("");
  const [lastDonation, setLastDonation] = useState("");
  const [medications, setMedications] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);



  const [hospitalName, setHospitalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodStock, setBloodStock] = useState("");
  const [storageCapacity, setStorageCapacity] = useState("");
  const [bloodComponents, setBloodComponents] = useState("");
  const [authorizedPerson, setAuthorizedPerson] = useState("");
  const [designation, setDesignation] = useState("");
  const [idProof, setIdProof] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [ambulanceAvailability, setAmbulanceAvailability] = useState(false);
  

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleRegister = (e) => {
    e.preventDefault();
    if (!consent) {
      alert("You must agree to the terms and conditions to register.");
      return;
    }

    if (userType === "donor") {
      const donorData = {
        name, dob, address, weight, hasDisease, disease, bloodType, aadhar, mobile,
        lastDonation, medications, emergency, email, password
      };
      localStorage.setItem("donor", JSON.stringify(donorData));
      localStorage.setItem("userType", "donor");
      alert("Donor Registered Successfully! Redirecting to Donor Dashboard.");
      navigate("/donor-dashboard");
    } else {
      const hospitalData = { hospitalName, location, email, password };
      localStorage.setItem("hospital", JSON.stringify(hospitalData));
      localStorage.setItem("userType", "hospital");
      alert("Hospital Registered Successfully! Redirecting to Hospital Dashboard.");
      navigate("/hospital-dashboard");
    }
  };

  return (
    <div className="register-container">
    <img src={registerImage} alt="Register" className="register-image" />
    {<img src={registerImage1} alt="Register" className="register2-image" />}

      <h2>Register as {userType === "donor" ? "Blood Donor" : "Hospital"}</h2>
      <div className="switch-container">
        <button className={userType === "donor" ? "active" : ""} onClick={() => setUserType("donor")}>Donor</button>
        <button className={userType === "hospital" ? "active" : ""} onClick={() => setUserType("hospital")}>Hospital</button>
      </div>
      <form onSubmit={handleRegister}>
        {userType === "donor" ? (
          <>
            <div className="input-box"><label>Full Name</label><input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="input-box"><label>Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
            <div className="input-box"><label>Address</label><input type="text" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
            <div className="input-box"><label>Weight (kg)</label><input type="number" placeholder="Enter your weight" value={weight} onChange={(e) => setWeight(e.target.value)} required /></div>
            <div className="input-box"><label>Blood Type</label><select value={bloodType} onChange={(e) => setBloodType(e.target.value)} required><option value="">Select Blood Type</option>{bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
            <div className="checkbox-container"><label>Do you have any disease?</label><input type="checkbox" checked={hasDisease} onChange={() => setHasDisease(!hasDisease)} /></div>
            {hasDisease && <div className="input-box"><label>If yes, specify:</label><input type="text" placeholder="Enter disease name" value={disease} onChange={(e) => setDisease(e.target.value)} required /></div>}
            <div className="input-box"><label>Aadhar Number</label><input type="text" placeholder="Enter your Aadhar number" value={aadhar} onChange={(e) => setAadhar(e.target.value)} required /></div>
            <div className="input-box"><label>Mobile Number</label><input type="tel" placeholder="Enter your mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required /></div>
            <div className="input-box"><label>Last Donation Date</label><input type="date" value={lastDonation} onChange={(e) => setLastDonation(e.target.value)} /></div>
            <div className="input-box"><label>Medications</label><input type="text" placeholder="Enter any medications you're taking" value={medications} onChange={(e) => setMedications(e.target.value)} /></div>
            <div className="checkbox-container"><label>Available for Emergency Donation</label><input type="checkbox" checked={emergency} onChange={() => setEmergency(!emergency)} /></div>
          </>
        ) : (
          <>
            <div className="input-box">
  <label>Hospital Name</label><input type="text" placeholder="Enter hospital name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required /></div>
<div className="input-box"><label>Registration Number</label><input type="text" placeholder="Enter registration number" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required /></div>
<div className="input-box"><label>Hospital Type</label><input type="text" placeholder="Enter hospital type" value={hospitalType} onChange={(e) => setHospitalType(e.target.value)} required /></div>
<div className="input-box"><label>Location</label><input type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
<div className="input-box"><label>Contact Number</label><input type="tel" placeholder="Enter contact number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required /></div>
<div className="input-box"><label>Emergency Contact</label><input type="tel" placeholder="Enter emergency contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required /></div>
<div className="input-box"><label>Blood Stock Available</label><input type="text" placeholder="Enter available blood stock" value={bloodStock} onChange={(e) => setBloodStock(e.target.value)} required /></div>
<div className="input-box"><label>Blood Storage Capacity</label><input type="text" placeholder="Enter storage capacity" value={storageCapacity} onChange={(e) => setStorageCapacity(e.target.value)} required /></div>
<div className="input-box"><label>Blood Components Available</label><input type="text" placeholder="Enter available blood components" value={bloodComponents} onChange={(e) => setBloodComponents(e.target.value)} required /></div>
<div className="input-box"><label>Authorized Person Name</label><input type="text" placeholder="Enter authorized person name" value={authorizedPerson} onChange={(e) => setAuthorizedPerson(e.target.value)} required /></div>
<div className="input-box"><label>Designation</label><input type="text" placeholder="Enter designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required /></div>

          </>
        )}
        <div className="input-box"><label>Email</label><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="input-box"><label>Password</label><input type="password" placeholder="Enter a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <div className="checkbox-container"><input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} required /><label>I agree to the terms and conditions</label></div>
        <button type="submit" className="final-submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
