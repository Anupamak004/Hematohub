import React from "react";
import "./PrivacyPolicy.css";  // Import CSS for styling

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p>Last updated: January 2025</p>

      <h2>Introduction</h2>
      <p>Welcome to HematoHub. We are committed to protecting your personal data and respecting your privacy.</p>

      <h2>Information We Collect</h2>
      <p>We may collect personal information such as your name, email, phone number, and blood donation history.</p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To facilitate blood donations and hospital management.</li>
        <li>To communicate important updates and notifications.</li>
        <li>To improve our services and user experience.</li>
      </ul>

      <h2>Security Measures</h2>
      <p>We take reasonable precautions to protect your information from unauthorized access, use, or disclosure.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about our Privacy Policy, please contact us at support@hematohub.com.</p>
    </div>
  );
};

export default PrivacyPolicy;
