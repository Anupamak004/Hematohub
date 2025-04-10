import Donor from "../models/donor.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs"; 
import axios from "axios";

async function sendEmail(recipient, subject, content) {
  const apiKey = process.env.BREVO_API_KEY.trim();
  
  try {
    console.log(`Attempting to send email to: ${recipient}`);
    
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.BREVO_EMAIL.trim(), name: 'Hematohub - Blood Bank System' },
        to: [{ email: recipient }],
        subject,
        htmlContent: content
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[EMAIL] Email sent to: ${recipient}`);
    return response.data;
  } catch (error) {
    console.error('[EMAIL ERROR]', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request was made but no response received');
    } else {
      console.error('Error setting up the request:', error.message);
    }
    throw new Error('Failed to send email');
  }
}


export const calculateEligibility = (donor) => {
  const age = getAge(donor.dob);
  const bmi = donor.height && donor.weight ? donor.weight / ((donor.height / 100) ** 2) : null;
  const currentDate = new Date();
  let nextDonationDate = null;

  if (donor.lastDonation) {
      nextDonationDate = new Date(donor.lastDonation);
      nextDonationDate.setMonth(nextDonationDate.getMonth() + 3);
  }

  if (age < 18 || age > 65) return false;
  if (bmi && (bmi < 18.5 || bmi > 30)) return false;
  if (donor.hasDisease || donor.medications) return false;
  if (nextDonationDate && currentDate < nextDonationDate) return false;
   
  return true;
};

const getAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = new Date() - birthDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const registerDonor = async (req, res) => {
  try {
    const { name, dob, gender, address, weight, height, bloodType, aadhar, mobile, email, password } = req.body;

    
    let donorExists = await Donor.findOne({ email });
    if (donorExists) return res.status(400).json({ error: "Donor already exists" });
    

    const newDonor = await Donor.create(req.body);
    newDonor.eligibility = calculateEligibility(newDonor);
    await newDonor.save(); // Save updated eligibility status

    const loginUrl = "http://localhost:3000/";
try {
  await sendEmail(
    email,
    "Donor Registration Successful",
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to HematoHub - Registration Successful</title>
    </head>
    <body>
      <div style="text-align:center; padding:20px; font-family:Arial, sans-serif;">
        <h2 style="color:#28a745;">Welcome to HematoHub</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for registering as a blood donor with <strong>HematoHub</strong>. Your commitment to saving lives is truly commendable.</p>

        <p>By joining HematoHub, you are now part of a lifesaving network that ensures blood is available to those in urgent need.</p>

        <div style="margin: 20px 0; padding: 10px; background-color:#f9f9f9; border-radius: 5px;">
          <h3>Your Donor Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Blood Type:</strong> ${bloodType}</p>
          <p><strong>Eligibility Status:</strong> ${newDonor.eligibility ? "Eligible for Donation" : "Currently Not Eligible"}</p>
        </div>

        <p>You can manage your profile, track donation history, and stay informed about urgent blood requests through HematoHub.</p>

        <p style="color:#777; font-size:12px; margin-top:20px;">
          Thank you for being a part of this life-saving journey.
        </p>

        <p style="color:#999; font-size:11px;">© 2025 HematoHub Blood Bank Management System. All rights reserved.</p>
      </div>
    </body>
    </html>`
  );

    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // Continue with registration even if email fails
    }
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error); // Fixed: changed alert(error) to console.error(error)
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
  

export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ error: "Donor not found" });

    res.json(donor);
  } catch (error) {
    console.error("Error fetching donor:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Donor Profile
export const updateDonor = async (req, res) => {
  try {
      // Find the existing donor
      const existingDonor = await Donor.findById(req.params.id);
      if (!existingDonor) return res.status(404).json({ error: "Donor not found" });

      // Extract updated donor data from request body
      const { dob, weight, height, hasDisease, medications, lastDonationDate, ...otherUpdates } = req.body;

      // Calculate age from date of birth
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      // Calculate BMI
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);

      // Determine next donation date (assuming a 3-month gap is required)
      const nextDonationDate = new Date(lastDonationDate);
      nextDonationDate.setMonth(nextDonationDate.getMonth() + 3);
      const currentDate = new Date();

      // Determine eligibility (true or false)
      let eligibility = true;

      if (age < 18 || age > 65) {
          eligibility = false;
      } else if (bmi < 18.5 || bmi > 30) {
          eligibility = false;
      } else if (hasDisease || medications) {
          eligibility = false;
      } else if (currentDate < nextDonationDate) {
          eligibility = false;
      }

      // Update donor details and eligibility in database
      const updatedDonor = await Donor.findByIdAndUpdate(
          req.params.id,
          { 
              ...otherUpdates,  // Update all other fields
              dob, weight, height, hasDisease, medications, lastDonationDate, 
              eligibility // Ensure eligibility is updated based on new data
          },
          { new: true } // Return updated donor
      );

      res.json({ message: "Profile updated successfully", donor: updatedDonor });
  } catch (error) {
      console.error("Error updating donor:", error);
      res.status(500).json({ error: "Server error" });
  }
};

const resetCodes = {};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const donor = await Donor.findOne({ email });
  if (!donor) return res.status(404).json({ message: "Email not found" });

  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit

  resetCodes[email] = code; // Save code temporarily

  try {
    await sendEmail(
      email,
      "HematoHub Password Reset Code",
      `<p>Your HematoHub password reset code is: <b>${code}</b></p>`
    );
    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};


export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (resetCodes[email] != code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await Donor.updateOne({ email }, { $set: { password: hashed } });

  if (updated.modifiedCount === 0) {
    return res.status(500).json({ message: "Failed to update password" });
  }

  delete resetCodes[email]; // Clean up
  res.json({ message: "Password updated successfully" });
};

