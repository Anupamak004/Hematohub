import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src="/icon.jpg" alt="Logo" className="logo-img" />
      <h2>HEMATOHUB</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/blood-stock">Blood Stock</Link></li> {/* New Blood Stock Link */}
      </ul>
    </nav>
  );
};

export default Navbar;
