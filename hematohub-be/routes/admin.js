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
            const emailSubject = "Your Blood Bank Account Has Been Removed";
            const emailContent = `
                <html>
                <body>
                    <h2>Blood Bank System Notification</h2>
                    <p>Dear ${donorName},</p>
                    <p>We regret to inform you that your donor account in our Blood Bank System has been removed by the administrator.</p>
                    <p>If you believe this is a mistake or wish to discuss this further, please contact our support team.</p>
                    <p>Thank you for your understanding.</p>
                    <p>Regards,<br>Blood Bank Administration</p>
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
            const emailSubject = "Your Hospital Account Has Been Removed";
            const emailContent = `
                <html>
                <body>
                    <h2>Blood Bank System Notification</h2>
                    <p>Dear ${hospitalName},</p>
                    <p>We regret to inform you that your hospital account in our Blood Bank System has been removed by the administrator.</p>
                    <p>If you believe this is a mistake or wish to discuss this further, please contact our support team.</p>
                    <p>Thank you for your understanding.</p>
                    <p>Regards,<br>Blood Bank Administration</p>
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