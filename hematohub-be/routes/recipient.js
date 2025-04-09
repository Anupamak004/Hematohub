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
// Route to add a new donation
router.post("/donate", async (req, res) => {
  try {
    const { recipientName, bloodType, date, units, hospitalId } = req.body;

    
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
    console.log("Blood before", hospital.bloodStock[bloodType]);
    
    if (hospital.bloodStock[bloodType] >= units) {
      hospital.bloodStock[bloodType] -= units;
      console.log("Blood after", hospital.bloodStock[bloodType]);
      
      // Add to receivedBlood array to track history
      hospital.receivedBlood.push({
        recipientName,
        bloodType,
        units,
        date: formattedDate
      });
      
      hospital.markModified("bloodStock");
      hospital.markModified("receivedBlood");
      await hospital.save();
    } else {
      return res.status(400).json({ error: "Not enough blood stock available" });
    }

    // Save donation to DB
    const donation = new Recipient({ recipientName, bloodType, date: formattedDate, units, hospitalId });
    console.log("Saving donation:", donation);
    await donation.save();
    console.log("Donation saved successfully:", donation);

    // Track notification counts
    let donorsNotified = 0;
    let hospitalsNotified = 0;

    
    if (hospital.bloodStock[bloodType] < hospital.bloodThreshold[bloodType]) {
      console.log(`Blood stock of ${bloodType} is below threshold, sending emails to donors and other hospitals...`);

      
      const unitsNeeded = (hospital.bloodThreshold[bloodType] - hospital.bloodStock[bloodType]) + 10;
      
      
      const donors = await Donor.find({ 
        bloodType,
        eligibility: true,
        hasDisease: false 
      });
      
      if (donors.length > 0) {
        const donorEmailPromises = donors.map(async (donor) => {
          try {
            await sendEmail(
              donor.email,
              `Urgent Blood Requirement - ${bloodType}`,
              `<html>
                <body>
                  <h2>Urgent Blood Donation Request</h2>
                  <p>Dear ${donor.name},</p>
                  <p>${hospital.hospitalName}, a ${hospital.hospitalType} hospital located at ${hospital.address}, is urgently running low on ${bloodType} blood.</p>
                  <p>We currently have ${hospital.bloodStock[bloodType]} units and need a total of ${unitsNeeded} more units.</p>
                  <p>Your contribution can save lives. Please consider donating.</p>
                  <p>Thank you for your help!</p>
                </body>
              </html>`
            );
            donorsNotified++;
          } catch (emailError) {
            console.error(`Failed to send email to donor ${donor.email}`, emailError);
          }
        });

        await Promise.all(donorEmailPromises);
        console.log(`Sent alert emails to ${donorsNotified} donors`);
      } else {
        console.log(`No eligible ${bloodType} donors found in the database`);
      }
      
      
      const otherHospitals = await Hospital.find({
        _id: { $ne: hospitalId }, 
        [`bloodStock.${bloodType}`]: { $gte: unitsNeeded + (hospital.bloodThreshold[bloodType] || 5) }
      });
      
      if (otherHospitals.length > 0) {
        const hospitalEmailPromises = otherHospitals.map(async (otherHospital) => {
          try {
            await sendEmail(
              otherHospital.email,
              `Blood Supply Request - ${bloodType}`,
              `<html>
                <body>
                  <h2>Blood Supply Request</h2>
                  <p>Dear ${otherHospital.hospitalName},</p>
                  <p>${hospital.hospitalName} is currently experiencing a shortage of ${bloodType} blood type.</p>
                  <p>Current stock: ${hospital.bloodStock[bloodType]} units</p>
                  <p>Units needed: ${unitsNeeded} units</p>
                  <p>Our records indicate your facility may have sufficient surplus to assist us.</p>
                  <p>Please contact us at ${hospital.phoneNumber} or ${hospital.email} if you can help with a blood transfer.</p>
                  <p>Thank you for your cooperation in this important matter.</p>
                  <p>Regards,<br>${hospital.hospitalName}</p>
                </body>
              </html>`
            );
            hospitalsNotified++;
          } catch (emailError) {
            console.error(`Failed to send email to hospital ${otherHospital.email}, emailError`);
          }
        });
        
        await Promise.all(hospitalEmailPromises);
        console.log(`Sent alert emails to ${hospitalsNotified} hospitals`);
      } else {
        console.log(`No hospitals with sufficient ${bloodType} blood stock found`);
      }
    }

    res.status(201).json({ 
      message: "Donation recorded successfully", 
      alerts: {
        donorsNotified,
        hospitalsNotified
      }
    });
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
