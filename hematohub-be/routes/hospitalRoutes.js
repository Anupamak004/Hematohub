import express from "express";
import { registerHospital } from "../controllers/hospitalController.js";
import { loginHospital } from "../controllers/hospitalController.js";
import {authenticateHospital} from "../middleware/auth.js";
import { getHospitalDashboard } from "../controllers/hospitalController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Hospital from "../models/hospital.js";
import Donor from '../models/donor.js';
import axios from 'axios';
import { forgotPassword, resetPassword } from "../controllers/hospitalController.js";



const router = express.Router();

router.post("/register", registerHospital);
router.post("/login", loginHospital); // Add login route
router.get("/dashboard", authenticateHospital, getHospitalDashboard); // Protected route
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

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

    if (!hospitalId || !bloodType || !units) {
      return res.status(400).json({ error: 'All fields (hospitalId, bloodType, units) are required' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      console.log(" Hospital not found");
      return res.status(404).json({ error: 'Hospital not found' });
    }

    console.log(` Blood request received: ${units} units of ${bloodType} from ${hospital.hospitalName}`);

    const donorQuery = {
      eligibility: true,
      hasDisease: false,
      bloodType: bloodType === 'ALL' ? { $exists: true } : bloodType
    };

    const donors = await Donor.find(donorQuery);

    let donorsNotified = 0;
    let hospitalsNotified = 0;

    if (donors.length > 0) {
      console.log(`Found ${donors.length} eligible donors for ${bloodType}`);

      const emailPromises = donors.map(async (donor) => {
        const emailSubject = "⚠️ URGENT: Immediate Blood Donation Required";
        const emailContent = `
          <html>
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Urgent Blood Donation Request</h2>

    <p>Dear <strong>${donor.name}</strong>,</p>

    <p>We are reaching out to inform you of an immediate need for <strong>${units} unit(s)</strong> of <strong>${bloodType}</strong> blood at <strong>${hospital.hospitalName}</strong>. You are receiving this message because you are currently eligible to donate blood of this type.</p>

    <h3 style="color: #d32f2f;">Hospital Details</h3>
        <p><strong>Hospital Name:</strong> ${hospital.hospitalName}</p>
    <p><strong>Address:</strong>${hospital.city}, ${hospital.state}</p>
    <p><strong>Contact Number:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></p>

    <h3 style="color: #d32f2f;">Your Support Is Vital</h3>
    <p>If you are available, we kindly urge you to visit the hospital at your earliest convenience to make a donation.</p>

    <p>Your contribution could make a life-saving difference for someone in urgent need. We sincerely appreciate your continued support and generosity.</p>

    <p>Warm regards,<br>
    <strong>HematoHub Blood Bank Team</strong></p>
  </body>
</html>

        `;

        try {
          await sendEmail(donor.email, emailSubject, emailContent);
          donorsNotified++;
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${donor.email}:`, emailError);
        }
      });

      await Promise.all(emailPromises);
    } else {
      console.log(`⚠️ No eligible donors found for ${bloodType}`);
    }

    const unitsNum = parseInt(units, 10);

    // Find hospitals with surplus blood stock
    const eligibleHospitals = await Hospital.find({ _id: { $ne: hospitalId } });

    const hospitalsToNotify = eligibleHospitals.filter(h => {
      if (bloodType === 'ALL') return true;
      const stockValue = parseInt(h.bloodStock[bloodType] || 0, 10);
      const thresholdValue = parseInt(h.bloodThreshold[bloodType] || 0, 10);
      return stockValue > (thresholdValue + 10 + unitsNum);
    });

    if (hospitalsToNotify.length > 0) {
      console.log(`✅ Found ${hospitalsToNotify.length} hospitals with surplus ${bloodType} blood`);

      const hospitalEmailPromises = hospitalsToNotify.map(async (eligibleHospital) => {
        const emailSubject = '🚨 URGENT: Blood Supply Request';
        const emailContent = `
          <html>
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Emergency Blood Transfer Request</h2>

    <p>Dear <strong>${eligibleHospital.hospitalName}</strong>,</p>

    <p>We are reaching out to request an urgent transfer of <strong>${units} unit(s)</strong> of <strong>${bloodType}</strong> blood. <strong>${hospital.hospitalName}</strong> is currently experiencing a critical need and would greatly appreciate any support your facility may be able to provide.</p>

    <h3 style="color: #d32f2f;">Requesting Hospital Information</h3>
    <p><strong>Hospital Name:</strong> ${hospital.hospitalName}</p>
    <p><strong>Phone:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${hospital.email}">${hospital.email}</a></p>
    <p><strong>Address:</strong>${hospital.city}, ${hospital.state}</p>

    <p>If your facility is able to assist with this request, please get in touch with the requesting hospital at your earliest convenience.</p>

    <p>We sincerely thank you for your cooperation and continued dedication to saving lives through collaborative efforts.</p>

    <p>Best regards,<br>
    <strong>HematoHub Coordination Team</strong></p>
  </body>
</html>

        `;

        try {
          await sendEmail(eligibleHospital.email, emailSubject, emailContent);
          hospitalsNotified++;
        } catch (emailError) {
          console.error(`❌ Failed to send email to hospital ${eligibleHospital.hospitalName}:`, emailError);
        }
      });

      await Promise.all(hospitalEmailPromises);
    } else {
      console.log(`⚠️ No hospitals with surplus stock found for ${bloodType}`);
    }

    if (donorsNotified === 0 && hospitalsNotified === 0) {
      return res.status(404).json({ message: 'No eligible donors or hospitals found for the requested blood type' });
    }

    res.status(200).json({
      message: `Blood request processed successfully`,
      donorsNotified,
      hospitalsNotified,
      totalNotifications: donorsNotified + hospitalsNotified
    });

  } catch (error) {
    console.error('❌ Blood Request Error:', error);
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
      hospitalType: hospital.hospitalType,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      phoneNumber: hospital.phoneNumber,
      email: hospital.email,
      bloodStock: hospital.bloodStock,
      country: hospital.country,
      zip: hospital.zip,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hospital data" });
  }
});


export default router;
