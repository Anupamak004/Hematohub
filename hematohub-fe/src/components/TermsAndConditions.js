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
        <p>Welcome to HematoHub. By registering as a donor or a hospital on our platform, you agree to abide by these Terms and Conditions. Please read them carefully before using our services.</p>
      </section>

      <section>
        <h2>2. Eligibility Criteria</h2>
        <h3>For Donors:</h3>
        <ul>
          <li>You must be at least 18 years of age and not more than 65 years old.</li>
          <li>Your body weight must be at least 50 kg.</li>
          <li>You must be in good general health and free from any transmissible diseases.</li>
          <li>You must not have donated blood in the past 3 months (90 days).</li>
          <li>You must not be pregnant, breastfeeding, or have given birth within the past 6 months.</li>
          <li>You must not have had a tattoo or body piercing within the past 6 months.</li>
          <li>You must not have consumed alcohol within 24 hours before donation.</li>
          <li>You must not be under medication for chronic illnesses unless medically approved for donation.</li>
        </ul>

        <h3>For Hospitals:</h3>
        <ul>
          <li>The hospital must be a legally registered and licensed medical institution.</li>
          <li>A valid Blood Bank License Number must be provided.</li>
          <li>The hospital must maintain accurate and updated records of blood stock inventory.</li>
          <li>The hospital must adhere to all local, regional, and national laws and regulations regarding blood storage, transfusion, and donation safety.</li>
          <li>Only authorized personnel should operate and manage the hospital account on HematoHub.</li>
        </ul>
      </section>

      <section>
        <h2>3. User Responsibilities</h2>
        <p>All users must provide accurate and up-to-date information. It is the responsibility of the user to update their information in case of any changes. HematoHub is not liable for any actions or outcomes resulting from false or outdated information.</p>
      </section>

      <section>
        <h2>4. Data Privacy & Security</h2>
        <p>Your privacy is important to us. All personal and medical information provided is handled in accordance with our Privacy Policy. We use appropriate security measures to protect your data and do not sell or share it with third parties without consent.</p>
      </section>

      <section>
        <h2>5. Platform Disclaimer & Liability</h2>
        <p>HematoHub acts solely as a facilitator to connect eligible donors with registered hospitals. We do not participate in or guarantee the outcome of any blood donation or transfusion. Users must follow standard medical procedures and precautions. HematoHub is not liable for any medical, legal, or personal issues that arise outside of our platform.</p>
      </section>

      <section>
        <h2>6. Amendments</h2>
        <p>HematoHub reserves the right to modify these Terms and Conditions at any time. Continued use of the platform after changes indicates acceptance of the updated terms.</p>
      </section>

      <section>
        <h2>7. Contact Us</h2>
        <p>For any questions, concerns, or feedback, please contact our support team at <a href="mailto:support@hematohub.com">support@hematohub.com</a>.</p>
      </section>

      <button onClick={() => navigate(-1)} className="back-button">Back to Registration</button>
    </div>
  );
};

export default TermsAndConditions;