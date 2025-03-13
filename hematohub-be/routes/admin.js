// backend/routes/admin.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Hospital from '../models/hospital.js';
import Donor from '../models/donor.js';
import { sendNotification } from '../utils/notifications.js';
import adminAuth from "../middleware/adminAuth.js"; // Adjust the path if necessary


const router = express.Router();

// Hardcoded admin credentials (change to database-based later)
const ADMIN_CREDENTIALS = {
    email: "admin@gmail.com",
    password: "$2b$10$VrIB2ywcAnKdg6Iwx6ihVekpOwf0W5KThZGzjk0RVDNkBw5GVQA8S" // bcrypt hashed password
};


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

router.delete("/donors/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const donor = await Donor.findByIdAndDelete(id);

        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }

        res.json({ message: "Donor deleted successfully" });
    } catch (error) {
        console.error("Error deleting donor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




router.delete("/hospitals/:id", adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await Hospital.findByIdAndDelete(id);
        res.json({ message: "Hospital deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting hospital" });
    }
});


export default router;
