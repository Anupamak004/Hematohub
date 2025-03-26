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
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { password, ...updateData } = req.body;
  
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
  
      const updatedDonor = await Donor.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
  
      if (!updatedDonor) return res.status(404).json({ message: "Donor not found" });
  
      res.json({ message: "Profile updated successfully", donor: updatedDonor });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });


  // 🟢 PUT: Update last donation date
  router.put("/:donorId/donations", async (req, res) => {
    try {
        const { lastDonation } = req.body;
        const donor = await Donor.findById(req.params.donorId);
  
        if (!donor) return res.status(404).json({ message: "Donor not found" });
  
        // Convert string to Date
        const newDonationDate = new Date(lastDonation);

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
        donor.eligibility = calculateEligibility(donor);
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





router.get("/:donorId/donations", async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.donorId);
        if (!donor) return res.status(404).json({ message: "Donor not found" });

        // Convert lastDonation to yyyy-MM-dd format
        const previousDonationDate = donor.lastDonation
            ? donor.lastDonation.toISOString().split("T")[0] // Extract only the date part
            : null;

        // Calculate next eligible date (3 months later)
        const nextEligibleDate = donor.lastDonation
            ? new Date(new Date(donor.lastDonation).setMonth(new Date(donor.lastDonation).getMonth() + 3))
                  .toISOString()
                  .split("T")[0]
            : "Not available";

        res.json([{ previousDonationDate, nextEligibleDate }]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

  

export default router;
