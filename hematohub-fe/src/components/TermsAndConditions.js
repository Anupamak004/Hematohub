import React from "react";
import "./TermsAndConditions.css";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
    const navigate = useNavigate();
  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>
      
      <section>
        <h2>1. Introduction</h2>
        <p>Welcome to HematoHub. By registering as a donor or hospital, you agree to these terms and conditions.</p>
      </section>

      <section>
        <h2>2. Eligibility Criteria</h2>
        <h3>For Donors:</h3>
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>You must be in good health and meet donation requirements.</li>
        </ul>
        <h3>For Hospitals:</h3>
        <ul>
          <li>Hospitals must be legally registered.</li>
          <li>Accurate blood inventory data must be maintained.</li>
        </ul>
      </section>

      <section>
        <h2>3. User Responsibilities</h2>
        <p>Users must provide valid information. HematoHub is not responsible for false data.</p>
      </section>

      <section>
        <h2>4. Data Privacy & Security</h2>
        <p>Your data is protected under our Privacy Policy. We do not sell or misuse user data.</p>
      </section>

      <section>
        <h2>5. Liability & Disclaimer</h2>
        <p>HematoHub serves as a connector and does not guarantee blood availability or donation safety.</p>
      </section>

      <section>
        <h2>6. Contact Us</h2>
        <p>For any questions, email us at <a href="mailto:support@hematohub.com">support@hematohub.com</a>.</p>
      </section>
      <button onClick={() => navigate(-1)} className="back-button">Back to Registration</button>
    </div>
  );
};

export default TermsAndConditions;
