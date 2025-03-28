import express from "express";
import { registerDonor } from "../controllers/donorController.js";
import {authenticateDonor} from "../middleware/auth.js";
import { getDonorDashboard } from "../controllers/donorController.js";
import { loginDonor } from "../controllers/donorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getDonorDetails, updateDonorDetails } from "../controllers/donorController.js";
import { protect } from "../middleware/authMiddleware.js";
import Donor from "../models/donor.js"; // Import donor model
import { calculateEligibility } from "../controllers/donorController.js";

const router = express.Router();

router.post("/register", registerDonor);
router.get("/dashboard", authenticateDonor, getDonorDashboard);
router.post("/login", loginDonor); // Add login route
router.route("/:id").get(protect, getDonorDetails).put(protect, updateDonorDetails);

router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const donor = await Donor.findById(req.params.id).select("-password"); // Exclude password
      if (!donor) return res.status(404).json({ message: "Donor not found" });
  
      res.json(donor);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // PUT: Update donor profile


// 🟢 GET: Fetch donation history for a donor
router.get("/:donorId/donations", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.donorId);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    res.json(donor.donationHistory); // Return full donation history
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🟢 PUT: Update last donation date & save history
router.put("/:donorId/donations", async (req, res) => {
  try {
    const { lastDonation } = req.body;
    const donor = await Donor.findById(req.params.donorId);

    if (!donor) return res.status(404).json({ message: "Donor not found" });

    // Convert string to Date
    const newDonationDate = new Date(lastDonation);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day

    // 🚫 Prevent future dates
    if (newDonationDate > today) {
      return res.status(400).json({ message: "Error: Future dates are not allowed." });
    }

    // 🚫 Prevent entering a date before the last donation date
    if (donor.lastDonation && newDonationDate < donor.lastDonation) {
      return res.status(400).json({
        message: `Error: Donation date cannot be before your last recorded donation on ${donor.lastDonation.toISOString().split("T")[0]}.`
      });
    }

    // 🚫 Enforce 3-month restriction
    if (donor.lastDonation) {
      const lastDonationDate = new Date(donor.lastDonation);
      const minNextDonationDate = new Date(lastDonationDate);
      minNextDonationDate.setDate(minNextDonationDate.getDate() + 90); // 90-day restriction

      if (newDonationDate < minNextDonationDate) {
        return res.status(400).json({ 
          message: `Error: You must wait at least 3 months (until ${minNextDonationDate.toISOString().split("T")[0]}) before donating again.` 
        });
      }
    }

    // Calculate next eligible date (3 months later)
    const nextEligibleDate = new Date(newDonationDate);
    nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);

    // Save the new donation history entry
    donor.donationHistory.push({
      previousDonationDate: newDonationDate,
      nextEligibleDate: nextEligibleDate
    });

    // Update last donation
    donor.lastDonation = newDonationDate;
    donor.eligibility = new Date() >= nextEligibleDate; // Eligibility check
    await donor.save();

    res.json({ 
      message: "Donation history updated successfully", 
      donationHistory: donor.donationHistory,
      eligibility: donor.eligibility
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});



export default router;
