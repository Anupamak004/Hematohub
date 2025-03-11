import express from "express";
import { registerHospital } from "../controllers/hospitalController.js";
import { loginHospital } from "../controllers/hospitalController.js";
import {authenticateHospital} from "../middleware/auth.js";
import { getHospitalDashboard } from "../controllers/hospitalController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", registerHospital);
router.post("/login", loginHospital); // Add login route
router.get("/dashboard", authenticateHospital, getHospitalDashboard); // Protected route


router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.id).select("-password");
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // Get Blood Requests (Protected)
  router.get("/blood-requests", authMiddleware, async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.id);
      res.json(hospital.bloodRequests || []);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // Submit a Blood Request
  router.post("/blood-requests", authMiddleware, async (req, res) => {
    const { bloodType, quantity, urgency } = req.body;
  
    try {
      const hospital = await Hospital.findById(req.user.id);
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  
      const newRequest = { id: Date.now(), bloodType, quantity, urgency, status: "Pending" };
      hospital.bloodRequests = [...(hospital.bloodRequests || []), newRequest];
  
      await hospital.save();
      res.json({ message: "Request submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // Cancel Blood Request
  router.delete("/blood-requests/:id", authMiddleware, async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.id);
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  
      hospital.bloodRequests = hospital.bloodRequests.filter((req) => req.id !== parseInt(req.params.id));
      await hospital.save();
      res.json({ message: "Request cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // Fetch Notifications
  router.get("/notifications", authMiddleware, async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.id);
      res.json(hospital.notifications || []);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });

  router.get("/profile", authMiddleware, async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.user.id).select("-password");
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update Blood Stock
  router.put("/update-stock", authMiddleware, async (req, res) => {
    try {
      const { bloodStock } = req.body;
      await Hospital.findByIdAndUpdate(req.user.id, { bloodStock });
      res.json({ message: "Blood stock updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get Urgent Blood Requests
  router.get("/urgent-requests", authMiddleware, async (req, res) => {
    try {
      const hospitals = await Hospital.find({});
      const urgentRequests = hospitals.filter(hospital => {
        return Object.keys(hospital.bloodStock).some(
          (bloodType) => hospital.bloodStock[bloodType] <= hospital.threshold[bloodType]
        );
      });
      res.json(urgentRequests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update Blood Donation & Reception
  router.put("/update-donation-reception", authMiddleware, async (req, res) => {
    try {
      const { bloodType, amount, type } = req.body; // type: "donated" or "received"
      const hospital = await Hospital.findById(req.user.id);
      if (!hospital) return res.status(404).json({ message: "Hospital not found" });
      
      if (type === "donated") {
        hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) - amount;
      } else {
        hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) + amount;
      }
      await hospital.save();
      res.json({ message: "Blood stock updated" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

export default router;
