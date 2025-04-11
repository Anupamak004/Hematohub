import React, { useState } from "react";
import { useNavigate, useSearchParams ,Link} from "react-router-dom";
import "./Register.css";
import registerImage from "../assets/blooddonation2.png";
import registerImage1 from "../assets/blooddonation3.png";
import registerImage3 from "../assets/blooddonation4.png";


const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(searchParams.get("type") || "donor");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [hasDisease, setHasDisease] = useState(false);
  const [disease, setDisease] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [mobile, setMobile] = useState("");
  const [lastDonation, setLastDonation] = useState("");
  const [medications, setMedications] = useState(null);
  const [emergency, setEmergency] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasDonated, setHasDonated] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState(""); // ✅ Error state



  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Validation functions
  const validateHeight = (value) => value >= 150; // Minimum height 150 cm

  // Validation function for Aadhar (12-digit number)
  const validateAadhar = (value) => /^\d{12}$/.test(value);

  // Validation function for mobile number (10-digit)
  const validateMobile = (value) => /^\d{10}$/.test(value);

  // Validation function for weight (minimum 50 kg)
  const validateWeight = (value) => value >= 50;
  const [consent, setConsent] = useState(false);



  const [hospitalName, setHospitalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("India");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bloodBankAvailable, setBloodBankAvailable] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bloodStock, setBloodStock] = useState({
    "A+": "",
    "A-": "",
    "B+": "",
    "B-": "",
    "AB+": "",
    "AB-": "",
    "O+": "",
    "O-": "",
  });
  
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [bloodThreshold, setBloodThreshold] = useState({
    "A+": 5,
    "A-": 5,
    "B+": 5,
    "B-": 5,
    "AB+": 5,
    "AB-": 5,
    "O+": 5,
    "O-": 5,
  });
  
  const [website, setWebsite] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



    const validatePhone = (num) => /^[0-9]{10}$/.test(num);
    const validateZip = (zip) => /^[0-9]{4,10}$/.test(zip);
    const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);


    const handleRegister = async (e) => {
      e.preventDefault();
      if (userType === "donor") {
        if (hasDonated === null) {
          setError("Please select an option."); // Show error if not selected
          return;
        } else {
          setError(""); // Clear error when valid
        }
    
        // Proceed with form submission
        console.log("Form submitted:", { hasDonated, lastDonation });
    
        if (!consent) {
          alert("You must agree to the terms and conditions to register.");
          return;
        }
    
        // Age validation (only for donors)
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
    
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
    
        if (age < 18 || age > 65) {
          alert("Registration failed: Donors must be between 18 and 65 years old.");
          return;
        }
      }
    
      const userData = userType === "donor" ? {
        name, dob, gender, address, weight, height, bloodType, hasDisease, aadhar, mobile, hasDonated, lastDonation: hasDonated ? lastDonation : null, medications, email, password
      } : {
        hospitalName, registrationNumber, hospitalType, email, phoneNumber, alternatePhone, address, city, state, zip, country, latitude, longitude, password, bloodBankAvailable, licenseNumber, bloodStock, website, operatingHours
      };
    
      try {
        const response = await fetch(`http://localhost:5000/api/${userType}s/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
    
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          alert("Please login");

          console.log(data.hospitalId);
          if (userType === "hospital" && data.hospitalId) {
            try {
              const thresholdResponse = await fetch("http://localhost:5000/api/recipients/check-stock-threshold", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hospitalId: data.hospitalId }),
              });
        
              const thresholdData = await thresholdResponse.json();
              if (thresholdResponse.ok) {
                console.log("Notification info:", thresholdData.alerts);
                if (thresholdData.alerts.donorsNotified > 0 || thresholdData.alerts.hospitalsNotified > 0) {
                  alert(`⚠️ Notifications sent to ${thresholdData.alerts.donorsNotified} donors and ${thresholdData.alerts.hospitalsNotified} hospitals due to low blood stock.`);
                }
              } else {
                console.warn("Threshold check failed:", thresholdData.error);
              }
            } catch (err) {
              console.error("Threshold check error:", err);
            }
          }
          navigate(`/`);
        } else {
          alert(data.error || "Registration failed. Try again.");
        }
        
      } catch (error) {
        console.error("Registration Error:", error);
        alert("Failed to register. Try again.");
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
            <div className="input-box">
        <label>Full Name <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="input-box">
        <label>Date of Birth <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
      </div>

      <div className="input-box">
        <label>Gender <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="input-box">
        <label>Address <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>

      <div className="input-box">
        <label>Weight (kg) <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="number" placeholder="Enter your weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
      </div>

      <div className="input-box">
        <label>Height (cm) <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="number" placeholder="Enter your height" value={height} onChange={(e) => setHeight(e.target.value)} required />
      </div>

      <div className="input-box">
        <label>Blood Type <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} required>
          <option value="">Select Blood Type</option>
          {bloodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="checkbox-container">
        <label>Do you have any disease?</label>
        <input type="checkbox" checked={hasDisease} onChange={() => setHasDisease(!hasDisease)} />
      </div>

      <div className="input-box">
        <label>Aadhar Number <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="Enter your Aadhar number" value={aadhar} onChange={(e) => setAadhar(e.target.value)} required />
        {errors.aadhar && <p>{errors.aadhar}</p>}
        {!validateAadhar(aadhar) && aadhar && <p className="error">Invalid aadhar number</p>}
      </div>

      <div className="input-box">
        <label>Mobile Number <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="tel" placeholder="Enter your mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
        {errors.mobile&& <p>{errors.mobile}</p>}
        {!validatePhone(mobile) && mobile && <p className="error">Invalid phone number</p>}
      </div>

      <div className="checkbox-container">
        <label>
          Have you donated blood before?
          <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span>
        </label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="yes"
              checked={hasDonated === true}
              onChange={() => setHasDonated(true)}
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              value="no"
              checked={hasDonated === false}
              onChange={() => {
                setHasDonated(false);
                setLastDonation(""); // Reset lastDonation if "No" is selected
              }}
            />
            No
          </label>
        </div>

        {/* Show error if user didn't select any option */}
        {error && <p style={{ color: "red", fontSize: "16px", marginTop: "5px" }}>{error}</p>}
      </div>

      {hasDonated === true && (
        <div className="input-box">
          <label>
            Last Donation Date
            <span style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}>*</span>
          </label>
          <input
            type="date"
            value={lastDonation}
            onChange={(e) => setLastDonation(e.target.value)}
            required
          />
        </div>
      )}



<div className="input-box">
  <label>Are you taking any medications? <span style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}>*</span></label>
  <div className="radio-group">
    <label>
      <input 
        type="radio" 
        name="medications" 
        value="yes" 
        checked={medications === "yes"} 
        onChange={() => setMedications("yes")} 
        required 
      /> 
      Yes
    </label>

    <label>
      <input 
        type="radio" 
        name="medications" 
        value="no" 
        checked={medications === "no"} 
        onChange={() => setMedications("no")} 
        required 
      /> 
      No
    </label>
  </div>
</div>


          </>
        ) : (
          <>
        <div className="input-box">
        <label>Hospital Name <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="Hospital Name" value={hospitalName} 
          onChange={(e) => setHospitalName(e.target.value)}
          required minLength={3} maxLength={100}
        />
      </div>

      <div className="input-box">
        <label>Registration Number <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="Registration Number" value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          required pattern="^[a-zA-Z0-9-/]+$"
        />
      </div>

      <div className="input-box">
        <label>Hospital Type <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <select value={hospitalType} onChange={(e) => setHospitalType(e.target.value)} required>
          <option value="">Select Type</option>
          <option value="Government">Government</option>
          <option value="Private">Private</option>
          <option value="Charitable">Charitable</option>
        </select>
      </div>

      <div className="input-box">
        <label>Phone Number <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="tel" placeholder="Phone Number" value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required pattern="[0-9]{10,15}"
        />
        {!validatePhone(phoneNumber) && phoneNumber && <p className="error">Invalid phone number</p>}
      </div>

      <div className="input-box">
        <label>Alternate Phone Number</label>
        <input type="tel" placeholder="Alternate Phone" value={alternatePhone}
          onChange={(e) => setAlternatePhone(e.target.value)}
          pattern="[0-9]{10,15}"
        />
      </div>

      <div className="input-box">
        <label>Address <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="Address" value={address}
          onChange={(e) => setAddress(e.target.value)}
          required minLength={10} maxLength={255}
        />
      </div>

      <div className="input-box">
        <label>City <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="City" value={city}
          onChange={(e) => setCity(e.target.value)}
          required pattern="^[A-Za-z\s]{2,50}$"
        />
      </div>

      <div className="input-box">
        <label>State <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="State" value={state}
          onChange={(e) => setState(e.target.value)}
          required pattern="^[A-Za-z\s]{2,50}$"
        />
      </div>

      <div className="input-box">
        <label>ZIP Code <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="text" placeholder="ZIP Code" value={zip}
          onChange={(e) => setZip(e.target.value)}
          required pattern="[0-9]{4,10}"
        />
        {!validateZip(zip) && zip && <p className="error">Invalid ZIP code</p>}
      </div>

      <div className="input-box">
        <label>Country <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input
    type="text"
    placeholder="Country"
    value="India"           // ✅ Hardcoded value
    readOnly               // ✅ Prevent user editing
    required
    pattern="^[A-Za-z\s]+$"
  />
      </div>

      <label className="input-box-label">Blood Bank Details <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
      <div className="blood-stock-box">
        <div className="input-box">
          <label>Blood Bank License Number <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
          <input type="text" placeholder="Blood Bank License Number" value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            required pattern="^[a-zA-Z0-9-]+$"
          />
        </div>

        <label className="input-box-label">Current Blood Stock Levels <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        {Object.keys(bloodStock).map((type) => (
          <div className="input-box1" key={type}>
            <input type="number" placeholder={`Initial Stock for ${type}`} value={bloodStock[type]}
              onChange={(e) => {
                const value = e.target.value;
                setBloodStock({ ...bloodStock, [type]: value === "" ? "" : Math.max(0, Number(value)) });
              }}
              min="0"
            />
          </div>
        ))}
      </div>
          </>
        )}
        <div className="input-box">
        <label>Email <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {!validateEmail(email) && email && <p className="error">Invalid email</p>}
      </div>

      <div className="input-box">
        <label>Password <span style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>*</span></label>
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {!validatePassword(password) && password && <p className="error">Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.</p>}
      </div>
        <div className="checkbox-container">
  <input 
    type="checkbox" 
    checked={consent} 
    onChange={() => setConsent(!consent)} 
    required 
  />
  <label>
    I agree to the{" "}
    <Link to="/terms-and-conditions" className="terms-link">Terms and Conditions</Link>
  </label>
</div>        <button type="submit" className="final-submit">Register</button>
      </form>
    </div>
  );
};

export default Register;