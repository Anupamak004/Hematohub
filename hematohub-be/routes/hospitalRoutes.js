import express from "express";
import { registerHospital } from "../controllers/hospitalController.js";
import { loginHospital } from "../controllers/hospitalController.js";
import {authenticateHospital} from "../middleware/auth.js";
import { getHospitalDashboard } from "../controllers/hospitalController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Hospital from "../models/hospital.js";
import Donor from '../models/donor.js';
import axios from 'axios';


const router = express.Router();

router.post("/register", registerHospital);
router.post("/login", loginHospital); // Add login route
router.get("/dashboard", authenticateHospital, getHospitalDashboard); // Protected route


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
      console.log(`[EMAIL] Email sent to: ${recipient}`);
      return response.data;
  } catch (error) {
      console.error('[EMAIL ERROR]', error.response?.data || error.message);
      throw new Error('Failed to send email');
  }
}

router.post('/blood-requests', async (req, res) => {
  try {
      const { hospitalId, bloodType, units } = req.body;

      // Find the hospital making the request
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
          console.log("'Hospital not found");
          return res.status(404).json({ error: 'Hospital not found' });
      }

      // Determine donor query based on blood type
      let donorQuery = { 
          eligibility: true,
          hasDisease:false, 
          bloodType: bloodType === 'ALL' ? { $exists: true } : bloodType 
      };

      // Find eligible donors matching the blood type
      const donors = await Donor.find(donorQuery);

      if (donors.length === 0) {
        console.log("'No donor not found");
          return res.status(404).json({ 
              message: 'No eligible donors found for the requested blood type' 
          });
      }

      // Send emails to all matching donors
      const emailPromises = donors.map(async (donor) => {
        const emailSubject = "⚠️ URGENT: Immediate Blood Donation Required";
    const emailContent = `
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #b71c1c;">🚨 CRITICAL BLOOD SHORTAGE – IMMEDIATE DONATION NEEDED</h2>
                <p>Dear <strong>${donor.name}</strong>,</p>
                
                <p style="font-size: 16px;">
                    We urgently need <strong>${units} unit(s) of ${bloodType} blood</strong> for a patient in critical condition.
                    Your donation is needed <strong>immediately</strong> at <strong>${hospital.hospitalName}</strong>.
                </p>

                <h3 style="color: #d32f2f;">Hospital Information:</h3>
                <p>
                    📍 <strong>Address:</strong> ${hospital.address}<br>
                    📞 <strong>Contact:</strong> <a href="tel:${hospital.phoneNumber}" style="color: #d32f2f;">${hospital.phoneNumber}</a>
                </p>

                <h3 style="color: #d32f2f;">Immediate Action Required</h3>
                <p style="font-size: 16px;">
                    If you are eligible to donate, <strong>please proceed to the hospital as soon as possible.</strong> 
                    This is a time-sensitive situation, and your contribution can save a life.
                </p>

                <p style="color: #b71c1c; font-weight: bold;">
                    <em>Your prompt response is crucial. Thank you for your willingness to help in this urgent medical emergency.</em>
                </p>
            </body>
        </html>
    `;

          try {
              await sendEmail(donor.email, emailSubject, emailContent);
          } catch (emailError) {
              console.error("Failed to send email to ${donor.email}", emailError);
          }
      });

      // Wait for all emails to be processed
      await Promise.all(emailPromises);

      res.status(200).json({ 
          message: `Blood request sent to ${donors.length} potential donors`,
          donorsNotified: donors.length
      });

  } catch (error) {
      console.error('Blood Request Error:', error);
      res.status(500).json({ error: 'Internal server error processing blood request' });
  }
});




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





router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, "hospitalName"); // Fetch only hospital names
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hospitals" });
  }
});

// ✅ Fetch Specific Hospital's Blood Stock
router.get("/:hospitalName", async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ hospitalName: req.params.hospitalName });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      hospitalName: hospital.hospitalName,
      registrationNumber: hospital.registrationNumber,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      phoneNumber: hospital.phoneNumber,
      email: hospital.email,
      bloodStock: hospital.bloodStock,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hospital data" });
  }
});


export default router;
