import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
        <img src="/icon.jpg" alt="Logo" className="logo-img" />
        <h2> HEMATOHUB
      </h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/About">About</Link></li>
        <li><Link to="/login"><button className="btn-primary">Login</button></Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
