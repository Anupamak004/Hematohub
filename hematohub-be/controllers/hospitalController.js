import Hospital from "../models/hospital.js";
import bcrypt from "bcryptjs"; // Added this import
import jwt from "jsonwebtoken";
import axios from "axios";
async function sendEmail(recipient, subject, content) {
  const apiKey = process.env.BREVO_API_KEY.trim();
  
  try {
    console.log(`Attempting to send email to: ${recipient}`);
    
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.BREVO_EMAIL.trim(), name: 'Blood Bank System' },
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

export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, registrationNumber, email, phoneNumber, password } = req.body;
    
    // Check if hospital already exists
    let hospitalExists = await Hospital.findOne({ email });
    if (hospitalExists) return res.status(400).json({ error: "Hospital already registered" });
    
    // Create the new hospital
    const newHospital = await Hospital.create(req.body);
    
    // Send confirmation email
    const loginUrl = "https://bloodbank-system.com/login";
    try {
      await sendEmail(
        email,
        "Registration successful",
        `<!DOCTYPE html>
        <html>
        <head><title>Registration Successful</title></head>
        <body>
          <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
            <h2 style="color:#28a745;">✔ Registration Successful!</h2>
            <p>Thank you for registering your hospital. Your account has been successfully created.</p>
            <p>You can now log in and start using our blood bank services.</p>
            <a href="${loginUrl}" style="background-color:#2D89FF; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Login Now</a>
            <p style="color:#777; font-size:12px; margin-top:20px;">© 2025 Blood Bank System. All rights reserved.</p>
          </div>
        </body>
        </html>`
      );
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // Continue with registration even if email fails
    }
    
    res.status(201).json({ message: "Hospital registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
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