import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2>HEMATOHUB</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/register-donor">Donor</Link></li>
        <li><Link to="/register-hospital">Hospital</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
