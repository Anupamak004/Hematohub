import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Updated styles

const Introduction = () => {
  const navigate = useNavigate();

  return (
    <div className="introduction-container">
      {/* Background Overlay */}
      <div className="overlay"></div>

      <div className="intro-content">
        <h1 className="fade-in">HematoHub: Where Every Drop Fuels a Life</h1>
        <h3>Welcome to <span className="highlight">HematoHub</span></h3>

        <p className="intro-text">
          A smart, efficient, and life-saving <b>Blood Bank Management System</b> 
          designed to seamlessly connect <b>generous donors</b> with <b>hospitals in need</b>.
        </p>

        <div className="animated-list">
          <p>🚑 <b>Urgent need for blood?</b> We’ve got you covered.</p>
          <p>❤️ <b>Ready to donate and save lives?</b> Join us today!</p>
          <p>🌍 <b>Together, we build a healthier community.</b></p>
        </div>

        {/* Buttons */}
        <div className="intro-buttons">
          <button className="btn primary glow" onClick={() => navigate("/login")}>Login</button>
          <button className="btn secondary glow" onClick={() => navigate("/register-donor")}>Donate Now</button>
          <button className="btn tertiary glow" onClick={() => navigate("/register-hospital")}>Register as Hospital</button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
