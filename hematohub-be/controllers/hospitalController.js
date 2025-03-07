import Hospital from "../models/hospital.js";
import bcrypt from "bcryptjs"; // Added this import
import jwt from "jsonwebtoken";


export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, registrationNumber, email, phoneNumber, password } = req.body;

    let hospitalExists = await Hospital.findOne({ email });
    if (hospitalExists) return res.status(400).json({ error: "Hospital already registered" });

    const newHospital = await Hospital.create(req.body);
    
    res.status(201).json({ message: "Hospital registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


export const loginHospital = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const hospital = await Hospital.findOne({ email });
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  
      const isMatch = await bcrypt.compare(password, hospital.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      res.status(200).json({ token, message: "Login successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };


  export const getHospitalDashboard = async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.hospital.id).select("-password");
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  
      res.status(200).json(hospital);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };  