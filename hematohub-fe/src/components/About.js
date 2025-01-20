import React from "react";
import "./About.css";  // Add styles if needed

const About = () => {
  return (
    <div className="about-container">
      <h1>About HematoHub</h1>
      <p>HematoHub is a cutting-edge Blood Bank Management System designed to connect donors, hospitals, and blood banks efficiently.</p>
      
      <h2>Our Mission</h2>
      <p>We aim to make blood donation seamless, accessible, and life-saving for those in need.</p>

      <h2>Why Choose Us?</h2>
      <ul>
        <li>Fast and secure blood donor registration</li>
        <li>Real-time blood availability tracking</li>
        <li>Efficient hospital and donor management</li>
      </ul>
    </div>
  );
};

export default About;
