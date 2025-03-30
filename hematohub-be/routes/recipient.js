import express from "express";
import Recipient from "../models/recipient.js";
import Hospital from "../models/hospital.js"; // Assuming you have a hospital model
import ReceivedBlood from "../models/donation.js";
import Donor from "../models/donor.js";
import axios from "axios";

const router = express.Router();

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
      throw new Error('Failed to send email');
  }
}

// Route to add a new donation
router.post("/donate", async (req, res) => {
  try {
    const { recipientName, bloodType, date, units, hospitalId } = req.body;

    // Validate input
    if (!recipientName || !bloodType || !date || !units || !hospitalId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    console.log("Received data:", { recipientName, bloodType, date, units, hospitalId });

    // Ensure date format is correct
    const formattedDate = new Date(date).toISOString();

    // Update blood stock in hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }
    console.log("Hospital found:", hospital);
    console.log("Blood before",hospital.bloodStock[bloodType]);
    if (hospital.bloodStock[bloodType] >= units) {
      hospital.bloodStock[bloodType] -= units;
      console.log("Blood after",hospital.bloodStock[bloodType]);
      hospital.markModified("bloodStock");
      await hospital.save();
    } else {
      return res.status(400).json({ error: "Not enough blood stock available" });
    }

    // Save donation to DB
    const donation = new Recipient({ recipientName, bloodType, date: formattedDate, units, hospitalId });
    console.log("Donation : ",donation);
    console.log("Saving donation:", donation);
    await donation.save();
    console.log("Donation saved successfully:", donation);

    if (hospital.bloodStock[bloodType] < hospital.bloodThreshold[bloodType]) {
          console.log(`Blood stock of ${bloodType} is below threshold, sending emails to donors...`);
    
          const donors = await Donor.find({ bloodType });
          
          // Calculate how many units are needed
          // Current logic: Get back to threshold + 10 extra units
          const unitsNeeded = (hospital.bloodThreshold[bloodType] - hospital.bloodStock[bloodType]) + 10;
          
          if (donors.length > 0) {
            const emailPromises = donors.map((donor) =>
              sendEmail(
                donor.email,
                `Urgent Blood Requirement - ${bloodType}`,
                `<p>Dear ${donor.name},</p>
                 <p>${hospital.hospitalName}, a ${hospital.hospitalType} hospital located at ${hospital.address}, is urgently running low on ${bloodType} blood.</p>
                 <p>We currently have ${hospital.bloodStock[bloodType]} units and need a total of ${unitsNeeded} units.</p>
                 <p>Your contribution can save lives. Please consider donating.</p>
                 <p>Thank you!</p>`
              )
            );
    
            await Promise.all(emailPromises);
            console.log(`Sent alert emails to ${donors.length} donors`);
          } else {
            console.log(`No ${bloodType} donors found in the database`);
          }
        }

    res.status(201).json({ message: "Donation recorded successfully" });
  } catch (error) {
    console.error("Error saving donation:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

  router.get("/donated-blood/:hospitalId", async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const recipients = await Recipient.find({ hospitalId }).sort({ date: -1 });
  
      if (!recipients.length) {
        return res.status(404).json({ message: "No recipient records found" });
      }
  
      console.log("Recipients Data:", recipients); // Debugging
  
      res.status(200).json(recipients);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  



// 🩸 Route to Add Received Blood Entry
router.post("/receive", async (req, res) => {
  try {
    const { receivedFrom, bloodType, receivedDate, units, hospitalId } = req.body;

    if (!receivedFrom || !bloodType || !units || !receivedDate || !hospitalId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Save received blood entry
    const receivedBlood = new ReceivedBlood({
      receivedFrom,
      bloodType,
      units,
      receivedDate: new Date(receivedDate).toISOString(),
      hospitalId
    });

    await receivedBlood.save();

    // Update hospital's blood stock (increase stock)
    hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) + units;
    hospital.markModified("bloodStock");
    await hospital.save();

    res.status(201).json({ message: "Received blood entry recorded successfully", receivedBlood });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


// 🩸 Route to Fetch Received Blood Entries for a Hospital
router.get("/received-blood/:hospitalId", async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const receivedBloodEntries = await ReceivedBlood.find({ hospitalId }).sort({ receivedDate: -1 });

    if (!receivedBloodEntries.length) {
      return res.status(404).json({ message: "No received blood records found" });
    }

    res.status(200).json({ receivedBloodEntries });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
