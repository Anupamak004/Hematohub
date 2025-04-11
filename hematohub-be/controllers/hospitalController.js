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
        sender: { email: process.env.BREVO_EMAIL.trim(), name: 'Hematohub-Blood Bank System' },
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
    console.log(`[EMAIL] Email sent to recipient : ${recipient}`);
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
    
    req.body.country = "India";

    // Create the new hospital
    const newHospital = await Hospital.create(req.body);
    
    // Send confirmation email
    const loginUrl = "http://localhost:3000/";
try {
  await sendEmail(
    email,
    "Registration Successful",
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to HematoHub</title>
    </head>
    <body>
      <div style="text-align:center; padding:20px; font-family:Arial, sans-serif;">
        <h2 style="color:#28a745;">Hospital Registration Successful</h2>
        <p>Dear <strong>${hospitalName} Team</strong>,</p>
        <p>Welcome to <strong>HematoHub</strong>, your dedicated blood bank management system. Your hospital is now successfully registered.</p>
        
        <p>With HematoHub, you can:</p>
        <ul style="display:inline-block; text-align:left; margin: 10px auto;">
          <li>Manage your blood bank efficiently</li>
          <li>Track blood inventory in real-time</li>
          <li>Connect with eligible donors instantly</li>
          <li>Request urgent blood donations when needed</li>
        </ul>

        <div style="margin: 20px 0; padding: 10px; background-color:#f9f9f9; border-radius: 5px;">
          <h3>Your Hospital Details</h3>
          <p><strong>Hospital Name:</strong> ${hospitalName}</p>
          <p><strong>Registration Number:</strong> ${registrationNumber}</p>
          <p><strong>Contact:</strong> ${phoneNumber}</p>
        </div>

        <p>You can now log in and start managing your hospital's blood bank through the HematoHub platform.</p>

        <p style="color:#777; font-size:12px; margin-top:20px;">
          Thank you for joining HematoHub. Together, we save lives.
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
    
    res.status(201).json({ message: "Hospital registration successful",hospitalId: newHospital._id  });
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

  const resetCodes = {}; // In-memory, for demo. Use Redis/DB in production.

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const hospital = await Hospital.findOne({ email });
  if (!hospital) return res.status(404).json({ message: "Email not found" });

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
  const updated = await Hospital.updateOne({ email }, { $set: { password: hashed } });

  if (updated.modifiedCount === 0) {
    return res.status(500).json({ message: "Failed to update password" });
  }

  delete resetCodes[email]; // Clean up
  res.json({ message: "Password updated successfully" });
};