import React from "react";
import "./About.css"; // Ensure styles are well-structured

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About HematoHub</h1>
      <p className="about-description">
        HematoHub is an advanced Blood Bank Management System designed to bridge the gap between blood donors, hospitals, and blood banks. Our platform ensures a seamless, efficient, and reliable blood donation process.
      </p>

      <h2 className="about-heading">Our Mission</h2>
      <p className="about-text">
        Our mission is to enhance the accessibility and efficiency of blood donation by leveraging technology, ensuring that those in need receive timely assistance.
      </p>

      <h2 className="about-heading">Key Features</h2>
      <ul className="about-list">
        <li>Secure and seamless blood donor registration</li>
        <li>Real-time blood inventory tracking</li>
        <li>Efficient donor and hospital management</li>
        <li>Automated notifications for low blood stock</li>
        <li>Data-driven insights for better blood bank operations</li>
      </ul>

      <h2 className="about-heading">Why Choose HematoHub?</h2>
      <p className="about-text">
        HematoHub is built with a commitment to saving lives through technology. We provide a user-friendly and responsive platform optimized for all devices, ensuring quick access to critical blood donation services anytime, anywhere.
      </p>
    </div>
  );
};

export default About;
