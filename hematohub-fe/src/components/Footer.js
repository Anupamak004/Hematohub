import React from "react";
import { Link } from "react-router-dom";  // Use Link instead of <a>
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-copyright">
            <p>&copy; 2025 HematoHub | All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-contact">
            <p>Email: support@hematohub.com | Phone: +123 456 7890</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
