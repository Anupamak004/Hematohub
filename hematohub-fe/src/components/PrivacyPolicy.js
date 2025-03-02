import React from "react";
import "./PrivacyPolicy.css"; // Import CSS for styling

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated:</strong> January 2025</p>

      <h2>Introduction</h2>
      <p>Welcome to HematoHub. Your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and safeguard your personal information.</p>

      <h2>Information We Collect</h2>
      <p>We may collect and process the following types of personal information:</p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Blood donation history</li>
        <li>Any other relevant details required for blood donation and hospital coordination</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>Your personal information is used for the following purposes:</p>
      <ul>
        <li>Facilitating and managing blood donations.</li>
        <li>Notifying users of important updates, including donation requests and eligibility reminders.</li>
        <li>Enhancing our services to provide a seamless user experience.</li>
        <li>Ensuring compliance with relevant laws and regulations.</li>
      </ul>

      <h2>Data Security</h2>
      <p>We implement robust security measures to protect your personal data from unauthorized access, disclosure, or misuse. However, please note that no digital platform can guarantee absolute security.</p>

      <h2>Your Rights</h2>
      <p>You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact us.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions or concerns regarding this Privacy Policy, please reach out to us at <strong>support@hematohub.com</strong>.</p>
    </div>
  );
};

export default PrivacyPolicy;
