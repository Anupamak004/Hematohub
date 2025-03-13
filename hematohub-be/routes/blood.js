import express from "express";
import Hospital from "../models/hospital.js";
import Donation from "../models/donation.js";
import Recipient from "../models/recipient.js";

const router = express.Router();

// Handle blood donation
router.post("/donate", async (req, res) => {
  try {
    const { donorId, hospitalId, bloodType, quantity } = req.body;

    // Find hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Update stock
    hospital.currentStock[bloodType] += quantity;
    await hospital.save();

    // Save donation record
    const donation = new Donation({ donorId, hospitalId, bloodType, quantity });
    await donation.save();

    res.status(201).json({ message: "Donation recorded successfully", donation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Handle blood request
router.post("/request-blood", async (req, res) => {
  try {
    const { recipientId, hospitalId, bloodType, quantity } = req.body;

    // Find hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Check stock availability
    if (hospital.currentStock[bloodType] < quantity) {
      return res.status(400).json({ message: "Insufficient blood stock" });
    }

    // Update stock
    hospital.currentStock[bloodType] -= quantity;
    await hospital.save();

    // Save recipient record
    const recipient = new Recipient({ recipientId, hospitalId, bloodType, quantity });
    await recipient.save();

    res.status(201).json({ message: "Blood request processed successfully", recipient });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
