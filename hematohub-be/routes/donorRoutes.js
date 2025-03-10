import express from "express";
import { registerDonor } from "../controllers/donorController.js";
import {authenticateDonor} from "../middleware/auth.js";
import { getDonorDashboard } from "../controllers/donorController.js";
import { loginDonor } from "../controllers/donorController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", registerDonor);
router.get("/dashboard", authenticateDonor, getDonorDashboard);
router.post("/login", loginDonor); // Add login route

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


export default router;
