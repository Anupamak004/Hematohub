import Donor from "../models/donor.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Added this import

export const registerDonor = async (req, res) => {
  try {
    const { name, dob, gender, address, weight, height, bloodType, aadhar, mobile, email, password } = req.body;

    let donorExists = await Donor.findOne({ email });
    if (donorExists) return res.status(400).json({ error: "Donor already exists" });

    const newDonor = await Donor.create(req.body);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const getDonorDashboard = async (req, res) => {
  try {
    const donor = await Donor.findById(req.donor.id).select("-password"); // Exclude password
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginDonor = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const donor = await Donor.findOne({ email });
      if (!donor) return res.status(404).json({ message: "Donor not found" });
  
      const isMatch = await bcrypt.compare(password, donor.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ id: donor._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      return res.status(200).json({ token, userId: donor._id, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
