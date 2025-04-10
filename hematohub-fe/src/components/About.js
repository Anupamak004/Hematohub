import React from "react";
import "./About.css"; // Ensure styles are structured and responsive

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About HematoHub</h1>
      
      <p className="about-description">
        HematoHub is a comprehensive Blood Bank Management System committed to connecting blood donors, hospitals, and blood banks through a secure and streamlined digital platform. We aim to eliminate gaps in blood availability and ensure timely access for those in urgent need.
      </p>

      <h2 className="about-heading">Our Mission</h2>
      <p className="about-text">
        Our mission is to harness the power of technology to facilitate life-saving blood donations. HematoHub is designed to make the process efficient, accessible, and responsive—supporting critical healthcare needs across the community.
      </p>

      <h2 className="about-heading">Core Features</h2>
      <ul className="about-list">
        <li>Secure donor and hospital onboarding with validation</li>
        <li>Real-time monitoring and management of blood inventory</li>
        <li>Automated alerts for low blood stock and urgent requirements</li>
        <li>Seamless coordination between hospitals and donors</li>
        <li>Insightful analytics to optimize blood bank operations</li>
        <li>Responsive interface optimized for all devices and internet conditions</li>
      </ul>

      <h2 className="about-heading">Why HematoHub?</h2>
      <p className="about-text">
        At HematoHub, we prioritize reliability, data integrity, and life-saving outcomes. Our platform is built with an emphasis on security, scalability, and user experience—ensuring that healthcare providers and donors can act swiftly when lives are on the line.
      </p>

      <p className="about-text">
        Whether you’re a hospital seeking urgent blood support or a donor willing to make a difference, HematoHub is here to facilitate the connection with trust and transparency.
      </p>
    </div>
  );
};

export default About;
