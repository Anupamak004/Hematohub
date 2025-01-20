import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import RegisterDonor from "./components/RegisterDonor";
import RegisterHospital from "./components/RegisterHospital";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import About from "./components/About";  
import Contact from "./components/Contact";  
import PrivacyPolicy from "./components/PrivacyPolicy";  // Import Privacy Policy Page

const App = () => {
  return (
    <Router>
      <div className="main-content">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-donor" element={<RegisterDonor />} />
          <Route path="/register-hospital" element={<RegisterHospital />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />  {/* Privacy Policy Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
};

export default App;
