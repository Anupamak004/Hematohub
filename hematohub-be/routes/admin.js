import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Hospital from '../models/hospital.js';
import Donor from '../models/donor.js';
import { sendNotification } from '../utils/notifications.js';
import adminAuth from "../middleware/adminAuth.js"; // Adjust the path if necessary
import axios from 'axios'; // Make sure axios is imported

const router = express.Router();

// Hardcoded admin credentials (change to database-based later)
const ADMIN_CREDENTIALS = {
    email: "admin@gmail.com",
    password: "$2b$10$VrIB2ywcAnKdg6Iwx6ihVekpOwf0W5KThZGzjk0RVDNkBw5GVQA8S" // bcrypt hashed password
};

// Email sending function
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

// Admin login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (email !== ADMIN_CREDENTIALS.email) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const validPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
    if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    // Set JWT expiration to 1 hour (3600 seconds)
    const token = jwt.sign({ role: "admin", isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// Get all hospitals
router.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospitals' });
    }
});

// Approve or reject a hospital
router.put('/hospitals/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hospital status' });
    }
});

// Get all donors
router.get('/donors', async (req, res) => {
    try {
        const donors = await Donor.find();
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors' });
    }
});

// Approve or reject a donor
router.put('/donors/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const donor = await Donor.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(donor);
    } catch (error) {
        res.status(500).json({ message: 'Error updating donor status' });
    }
});

// Send notification to donors when stock is low
router.post('/notify-donors', async (req, res) => {
    try {
        const donors = await Donor.find(); // Get all donors
        donors.forEach(donor => sendNotification(donor.email, 'Urgent Blood Donation Needed!'));
        res.json({ message: 'Notifications sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending notifications' });
    }
});

// Delete donor with email notification
router.delete("/donors/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const donor = await Donor.findById(id);
        
        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }
        
        // Save donor email before deletion for notification
        const donorEmail = donor.email;
        const donorName = donor.name || "Donor";
        
        // Delete the donor
        await Donor.findByIdAndDelete(id);
        
        // Send email notification to donor
        try {
            const emailSubject = "Notice of Donor Account Removal - HematoHub";

const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Account Removal Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #c0392b;">Account Removal Notification</h2>
      <p>Dear <strong>${donorName}</strong>,</p>

      <p>We would like to inform you that your donor account has been removed from the HematoHub Blood Bank Management System by an administrator.</p>

      <p>This action may have been taken due to inactivity, data inconsistencies, or upon request. If you believe this decision was made in error or if you would like to inquire further, we encourage you to contact our support team at your earliest convenience.</p>

      <p>We value the contribution of all donors and appreciate your commitment to saving lives. Should you wish to rejoin HematoHub in the future, you are always welcome to register again.</p>

      <p>Thank you for your understanding.</p>

      <p>Best regards,<br>
      <strong>HematoHub Administration Team</strong></p>

      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #888;">This is an automated message from the HematoHub Blood Bank Management System. Please do not reply directly to this email.</p>
    </div>
  </body>
  </html>
`;

            
            await sendEmail(donorEmail, emailSubject, emailContent);
            
        } catch (emailError) {
            console.error("Failed to send deletion notification email:", emailError);
            // Continue execution even if email fails
        }
        
        res.json({ message: "Donor deleted successfully and notification email sent" });
    } catch (error) {
        console.error("Error deleting donor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete hospital with email notification
router.delete("/hospitals/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await Hospital.findById(id);
        
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }
        
        // Save hospital email before deletion for notification
        const hospitalEmail = hospital.email;
        const hospitalName = hospital.name || "Hospital";
        
        // Delete the hospital
        await Hospital.findByIdAndDelete(id);
        
        // Send email notification to hospital
        try {
            const emailSubject = "Notice of Hospital Account Removal - HematoHub";

const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Account Removal Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #c0392b;">Account Removal Notification</h2>
      <p>Dear <strong>${hospitalName} Team</strong>,</p>

      <p>We are writing to inform you that your hospital account has been removed from the HematoHub Blood Bank Management System by an administrator.</p>

      <p>This action may have been taken due to policy violations, administrative review, or inactivity. If you believe this action was taken in error or would like to discuss the matter further, please reach out to our support team.</p>

      <p>We appreciate your previous engagement with HematoHub and thank you for your efforts in supporting the blood donation ecosystem.</p>

      <p>Best regards,<br>
      <strong>HematoHub Administration Team</strong></p>

      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #888;">This is an automated message from the HematoHub Blood Bank Management System. Please do not reply directly to this email.</p>
    </div>
  </body>
  </html>
`;

            
            await sendEmail(hospitalEmail, emailSubject, emailContent);
            
        } catch (emailError) {
            console.error("Failed to send deletion notification email:", emailError);
            // Continue execution even if email fails
        }
        
        res.json({ message: "Hospital deleted successfully and notification email sent" });
    } catch (error) {
        console.error("Error deleting hospital:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;