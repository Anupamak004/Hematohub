import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import RegisterDonor from "./components/RegisterDonor";
import RegisterHospital from "./components/RegisterHospital";
import Login from "./components/Login";
import DonorDashboard from "./components/DonorDashboard"; // Renamed Dashboard to DonorDashboard
import HospitalDashboard from "./components/HospitalDashboard"; // Added Hospital Dashboard
import Footer from "./components/Footer";
import About from "./components/About";  
import Contact from "./components/Contact";  
import PrivacyPolicy from "./components/PrivacyPolicy";  

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
          <Route path="/donor-dashboard" element={<DonorDashboard />} /> {/* Updated route */}
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} /> {/* New hospital dashboard route */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
};

export default App;
