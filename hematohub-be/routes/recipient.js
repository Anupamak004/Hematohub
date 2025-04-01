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
                  `🚨 URGENT: Immediate Blood Donation Needed – ${bloodType}`,
                  `
                  <html>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                          <h2 style="color: #b71c1c;">⚠️ CRITICAL BLOOD SHORTAGE – IMMEDIATE ACTION REQUIRED</h2>
                          
                          <p>Dear <strong>${donor.name}</strong>,</p>
          
                          <p style="font-size: 16px;">
                              <strong>${hospital.hospitalName}</strong>, a <strong>${hospital.hospitalType}</strong> hospital, is facing an urgent shortage of <strong>${bloodType} blood</strong>.
                              The current stock is critically low, with only <strong>${hospital.bloodStock[bloodType]} units</strong> available. 
                              We urgently require <strong>${unitsNeeded} units</strong> to meet the immediate medical needs of patients.
                          </p>
          
                          <h3 style="color: #d32f2f;">Hospital Details:</h3>
                          <p>
                              📍 <strong>Location:</strong> ${hospital.address}, ${hospital.city}, ${hospital.state} <br>
                              📞 <strong>Contact:</strong> <a href="tel:${hospital.phone}" style="color: #d32f2f;">${hospital.phone}</a>
                          </p>
          
                          <h3 style="color: #d32f2f;">How You Can Help</h3>
                          <p style="font-size: 16px;">
                              If you are eligible to donate, please visit the hospital at the earliest opportunity. 
                              Your donation can make a life-saving difference.
                          </p>
          
                          <p style="font-size: 16px;">
                              <strong>Every second counts.</strong> Thank you for your generosity and willingness to help during this urgent medical need.
                          </p>
          
                          <p style="color: #b71c1c; font-weight: bold;">
                              <em>We deeply appreciate your support in saving lives.</em>
                          </p>
                      </body>
                  </html>
                  `
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
    const { receivedFrom, bloodType, receivedDate, units, hospitalId, dob, aadhaarLast4 } = req.body;

    if (!receivedFrom || !bloodType || !units || !receivedDate || !hospitalId || !dob || !aadhaarLast4) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate Aadhaar (only last 4 digits)
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      return res.status(400).json({ error: "Aadhaar number must be exactly 4 digits" });
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
      dob: new Date(dob).toISOString(), // Ensure valid date format
      aadhaarLast4, // Only store last 4 digits
      hospitalId
    });

    await receivedBlood.save();

    // Update hospital's blood stock (increase stock)
    hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) + units;
    hospital.markModified("bloodStock");
    await hospital.save();

    // ✅ Find donor by DOB and last 4 digits of Aadhaar
    const donor = await Donor.findOne({ dob: new Date(dob).toISOString(), aadhaarLast4 });

    if (donor) {
      const lastDonationDate = new Date(receivedDate);
      const nextEligibleDate = new Date(lastDonationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90); // 3-month restriction

      // Update donation history
      donor.donationHistory.push({
        previousDonationDate: lastDonationDate.toISOString(),
        nextEligibleDate: nextEligibleDate.toISOString(),
      });

      await donor.save();
    }

    res.status(201).json({ 
      message: "Received blood entry recorded successfully", 
      receivedBlood,
      donorUpdated: donor ? true : false
    });

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

    // Ensure response contains dob and Aadhaar (masked)
    const formattedEntries = receivedBloodEntries.map(entry => ({
      _id: entry._id,
      receivedFrom: entry.receivedFrom,
      bloodType: entry.bloodType,
      receivedDate: entry.receivedDate,
      units: entry.units,
      dob: entry.dob ? new Date(entry.dob).toISOString().split("T")[0] : "Unknown",
      aadhaarLast4: entry.aadhaarLast4 || "XXXX" // Masked Aadhaar
    }));

    res.status(200).json({ receivedBloodEntries: formattedEntries });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
