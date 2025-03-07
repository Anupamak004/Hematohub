import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import DonorDashboard from "./components/DonorDashboard"; 
import HospitalDashboard from "./components/HospitalDashboard"; 
import DonationHistory from "./components/DonationHistory"; 
import Footer from "./components/Footer";
import About from "./components/About";  
import Contact from "./components/Contact";  
import PrivacyPolicy from "./components/PrivacyPolicy";
import EditDonorProfile from "./components/EditDonorProfile";
import TermsAndConditions from "./components/TermsAndConditions";


import "./App.css";  

const App = () => {
  return (
    <Router>
      <div className="main-content">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} /> 
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} /> 
          <Route path="/donation-history" element={<DonationHistory />} /> 
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/donor/edit-profile" element={<EditDonorProfile />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
};

export default App;
