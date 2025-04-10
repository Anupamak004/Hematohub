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
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Urgent Blood Donation Request</h2>

    <p>Dear <strong>${donor.name}</strong>,</p>

    <p>We are contacting you as a currently eligible blood donor registered with <strong>HematoHub</strong>.</p>

<p><strong>${hospital.hospitalName}</strong>, a ${hospital.hospitalType} hospital, has reported that the available stock of <strong>${bloodType}</strong> blood has dropped below the safety threshold required for ongoing patient care. In response, we are reaching out to eligible donors to help restore adequate supply levels.</p>

    <h3 style="color: #d32f2f;">Hospital Details:</h3>
    <ul style="list-style: none; padding-left: 0;">
      <li><strong>Hospital Name:</strong> ${hospital.hospitalName}</li>
      <li><strong>Address:</strong> ${hospital.city}, ${hospital.state}, ${hospital.zip}, ${hospital.country}</li>
      <li><strong>Phone:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></li>
      ${
        hospital.alternatePhoneNumber
          ? `<li><strong>Alternate Phone:</strong> <a href="tel:${hospital.alternatePhoneNumber}">${hospital.alternatePhoneNumber}</a></li>`
          : ""
      }
      <li><strong>Email:</strong> <a href="mailto:${hospital.email}">${hospital.email}</a></li>
    </ul>

    <p><strong>Current Blood Stock:</strong> ${hospital.bloodStock[bloodType]} unit(s)</p>
    <p><strong>Units Required:</strong> ${unitsNeeded} unit(s)</p>

    <p>If you are available and willing, we kindly urge you to visit the hospital at your earliest convenience to make a donation. Your contribution can help save lives.</p>

    <p style="margin-top: 20px; font-style: italic; color: #555;">
      Thank you for your continued support and willingness to help in times of need.
    </p>

    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #888;">This message has been sent by HematoHub based on your verified eligibility status as a blood donor.</p>
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
              `Blood Supply Request – ${bloodType}`,
`<html>
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Request for Blood Unit Support</h2>

    <p>Dear <strong>${otherHospital.hospitalName}</strong>,</p>

<p>We are reaching out to request assistance following a drop in our <strong>${bloodType}</strong> blood supply below the operational threshold at <strong>${hospital.hospitalName}</strong>, a ${hospital.hospitalType} hospital.</p>

    <p><strong>Hospital Details:</strong><br>
       <li><strong>Hospital Name:</strong> ${hospital.hospitalName}</li>
      <li><strong>Address:</strong> ${hospital.city}, ${hospital.state}, ${hospital.zip}, ${hospital.country}</li>
      <li><strong>Phone:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></li>
       <li><strong>Email:</strong> ${hospital.email}</li>
    </p>

    <p><strong>Current Stock:</strong> ${hospital.bloodStock[bloodType]} unit(s)<br>
       <strong>Units Required:</strong> ${unitsNeeded} unit(s)</p>

    <p>According to available records, your facility may have sufficient stock to support this requirement. If you are able to assist by facilitating a blood unit transfer, your support would be highly valued and appreciated.</p>

    <p>Please contact us at your earliest convenience to coordinate further.</p>

    <p>We appreciate your continued collaboration in ensuring timely and effective patient care.</p>

    <p>Best regards,<br>
    <strong>${hospital.hospitalName}</strong></p>
  </body>
</html>`

            );
          } catch (emailError) {
            console.error(`Failed to send email to hospital ${otherHospital.email}`, emailError);
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


  router.post("/check-stock-threshold", async (req, res) => {
    try {
      const { hospitalId } = req.body;
  
      if (!hospitalId) {
        return res.status(400).json({ error: "Hospital ID is required" });
      }
  
      console.log(hospitalId);
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
  
      const lowStockTypes = [];
      const donorNotificationCounts = {};
      const hospitalNotificationCounts = {};
      let totalDonorsNotified = 0;
      let totalHospitalsNotified = 0;
  
      for (const bloodType in hospital.bloodStock) {
        const currentStock = hospital.bloodStock[bloodType] || 0;
        const threshold = hospital.bloodThreshold?.[bloodType] || 0;
  
        if (currentStock < threshold) {
          lowStockTypes.push(bloodType);
          const unitsNeeded = (threshold - currentStock) + 10;
  
          // Notify donors
          const donors = await Donor.find({
            bloodType,
            eligibility: true,
            hasDisease: false
          });
  
          const donorEmails = donors.map(async (donor) => {
            try {
              await sendEmail(
                donor.email,
                `Urgent Blood Requirement - ${bloodType}`,
                `<html>
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Urgent Blood Donation Request</h2>

    <p>Dear <strong>${donor.name}</strong>,</p>

    <p>We are contacting you as a currently eligible blood donor registered with <strong>HematoHub</strong>.</p>

<p><strong>${hospital.hospitalName}</strong>, a ${hospital.hospitalType} hospital, has reported that the available stock of <strong>${bloodType}</strong> blood has dropped below the safety threshold required for ongoing patient care. In response, we are reaching out to eligible donors to help restore adequate supply levels.</p>

    <h3 style="color: #d32f2f;">Hospital Details:</h3>
    <ul style="list-style: none; padding-left: 0;">
      <li><strong>Hospital Name:</strong> ${hospital.hospitalName}</li>
      <li><strong>Address:</strong> ${hospital.city}, ${hospital.state}, ${hospital.zip}, ${hospital.country}</li>
      <li><strong>Phone:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></li>
      ${
        hospital.alternatePhoneNumber
          ? `<li><strong>Alternate Phone:</strong> <a href="tel:${hospital.alternatePhoneNumber}">${hospital.alternatePhoneNumber}</a></li>`
          : ""
      }
      <li><strong>Email:</strong> <a href="mailto:${hospital.email}">${hospital.email}</a></li>
    </ul>

    <p><strong>Current Blood Stock:</strong> ${hospital.bloodStock[bloodType]} unit(s)</p>
    <p><strong>Units Required:</strong> ${unitsNeeded} unit(s)</p>

    <p>If you are available and willing, we kindly urge you to visit the hospital at your earliest convenience to make a donation. Your contribution can help save lives.</p>

    <p style="margin-top: 20px; font-style: italic; color: #555;">
      Thank you for your continued support and willingness to help in times of need.
    </p>

    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #888;">This message has been sent by HematoHub based on your verified eligibility status as a blood donor.</p>
  </body>
</html>`
              );
            } catch (err) {
              console.error(`Failed to email donor ${donor.email}:`, err);
            }
          });
          await Promise.all(donorEmails);
          donorNotificationCounts[bloodType] = donors.length;
          totalDonorsNotified += donors.length;
  
          // Notify hospitals
          const otherHospitals = await Hospital.find({
            _id: { $ne: hospitalId },
            [`bloodStock.${bloodType}`]: { $gte: unitsNeeded + (threshold || 5) }
          });
  
          const hospitalEmails = otherHospitals.map(async (otherHospital) => {
            try {
              await sendEmail(
                otherHospital.email,
                `Blood Supply Request - ${bloodType}`,
                `<html>
  <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #b71c1c;">Request for Blood Unit Support</h2>

    <p>Dear <strong>${otherHospital.hospitalName}</strong>,</p>

<p>We are reaching out to request assistance following a drop in our <strong>${bloodType}</strong> blood supply below the operational threshold at <strong>${hospital.hospitalName}</strong>, a ${hospital.hospitalType} hospital.</p>

    <p><strong>Hospital Details:</strong><br>
       <li><strong>Hospital Name:</strong> ${hospital.hospitalName}</li>
      <li><strong>Address:</strong> ${hospital.city}, ${hospital.state}, ${hospital.zip}, ${hospital.country}</li>
      <li><strong>Phone:</strong> <a href="tel:${hospital.phoneNumber}">${hospital.phoneNumber}</a></li>
       <li><strong>Email:</strong> ${hospital.email}</li>
    </p>

    <p><strong>Current Stock:</strong> ${hospital.bloodStock[bloodType]} unit(s)<br>
       <strong>Units Required:</strong> ${unitsNeeded} unit(s)</p>

    <p>According to available records, your facility may have sufficient stock to support this requirement. If you are able to assist by facilitating a blood unit transfer, your support would be highly valued and appreciated.</p>

    <p>Please contact us at your earliest convenience to coordinate further.</p>

    <p>We appreciate your continued collaboration in ensuring timely and effective patient care.</p>

    <p>Best regards,<br>
    <strong>${hospital.hospitalName}</strong></p>
  </body>
</html>`
              );
            } catch (err) {
              console.error(`Failed to email hospital ${otherHospital.email}:`, err);
            }
          });
          await Promise.all(hospitalEmails);
          hospitalNotificationCounts[bloodType] = otherHospitals.length;
          totalHospitalsNotified += otherHospitals.length;
        }
      }
  
      if (lowStockTypes.length === 0) {
        return res.status(200).json({ message: "All blood stocks are above threshold." });
      }
  
      res.status(200).json({
        message: "Notifications sent for low stock blood types.",
        lowStockTypes,
        donorNotificationCounts,
        hospitalNotificationCounts,
        totalDonorsNotified,
        totalHospitalsNotified
      });
  
    } catch (error) {
      console.error("Error checking blood stock:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });
  
  
  



// 🩸 Route to Add Received Blood Entry
router.post("/receive", async (req, res) => {
  try {
    const {
      receivedFrom,
      bloodType,
      receivedDate,
      units,
      hospitalId,
      dob,
      aadhaarLast4,
      donorType,
    } = req.body;

    if (!receivedFrom || !bloodType || !units || !receivedDate || !hospitalId || !donorType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    let receivedBlood;

    if (donorType === "person") {
      if (!dob || !aadhaarLast4) {
        return res.status(400).json({ error: "DOB and Aadhaar are required for person donors" });
      }

      if (!/^\d{4}$/.test(aadhaarLast4)) {
        return res.status(400).json({ error: "Aadhaar must be 4 digits" });
      }

      receivedBlood = new ReceivedBlood({
        receivedFrom,
        bloodType,
        units: Number(units),
        receivedDate: new Date(receivedDate),
        dob: new Date(dob),
        aadhaarLast4,
        hospitalId,
        donorType,
      });

      await receivedBlood.save();

      const donor = await Donor.findOne({
        dob: new Date(dob),
        aadhaarLast4,
      });

      if (donor) {
        const lastDonationDate = new Date(receivedDate);
        const nextEligibleDate = new Date(lastDonationDate);
        nextEligibleDate.setDate(lastDonationDate.getDate() + 90);

        donor.donationHistory.push({
          previousDonationDate: lastDonationDate,
          nextEligibleDate,
        });

        await donor.save();
      }
    } else if (donorType === "hospital") {
      receivedBlood = new ReceivedBlood({
        receivedFrom,
        bloodType,
        units: Number(units),
        receivedDate: new Date(receivedDate),
        hospitalId,
        donorType,
      });

      await receivedBlood.save();
    } else {
      return res.status(400).json({ error: "Invalid donor type provided." });
    }

    // Update hospital blood stock
    hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) + Number(units);
    hospital.markModified("bloodStock");
    await hospital.save();

    res.status(201).json({
      message: "Received blood entry recorded successfully",
      receivedBlood,
    });

  } catch (error) {
    console.error("💥 Server Error:", error); // Debug log
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
