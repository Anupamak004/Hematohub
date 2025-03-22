import express from 'express';
import Hospital from '../models/hospital.js'; // Hospital model
import Donation from '../models/donation.js'; // Donation model
import Recipient from '../models/recipient.js'; // Recipient model
import twilio from 'twilio';

const router = express.Router();

// Twilio Configuration (Replace with actual credentials)
const accountSid = 'your_twilio_account_sid';
const authToken = 'your_twilio_auth_token';
const twilioClient = twilio(accountSid, authToken);
const twilioNumber = 'your_twilio_phone_number';

// Fetch hospital details
router.get('/hospital/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch donations and recipients
router.get('/records/:hospitalId', async (req, res) => {
    try {
        const donations = await Donation.find({ hospitalId: req.params.hospitalId });
        const recipients = await Recipient.find({ hospitalId: req.params.hospitalId });
        res.json({ donations, recipients });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new donation
router.post('/donation', async (req, res) => {
    try {
        const { hospitalId, bloodType, quantity, donorName, date } = req.body;
        const donation = new Donation({ hospitalId, bloodType, quantity, donorName, date });
        await donation.save();

        // Update hospital blood stock
        await Hospital.findByIdAndUpdate(hospitalId, { $inc: { [`bloodStock.${bloodType}`]: quantity } });

        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new recipient
router.post('/recipient', async (req, res) => {
    try {
        const { hospitalId, bloodType, quantity, recipientName, date } = req.body;
        const recipient = new Recipient({ hospitalId, bloodType, quantity, recipientName, date });
        await recipient.save();

        // Reduce hospital blood stock
        await Hospital.findByIdAndUpdate(hospitalId, { $inc: { [`bloodStock.${bloodType}`]: -quantity } });

        res.status(201).json(recipient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send urgent blood request
router.post('/send-alert', async (req, res) => {
    try {
        const { hospitalId, bloodType, message } = req.body;
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

        // Find donors with matching blood type
        const donors = await Donor.find({ bloodType });
        const phoneNumbers = donors.map(donor => donor.phoneNumber);

        // Send SMS to donors
        const sendMessages = phoneNumbers.map(number => {
            return twilioClient.messages.create({
                body: `Urgent: ${message}`,
                from: twilioNumber,
                to: number,
            });
        });

        await Promise.all(sendMessages);
        res.json({ message: 'Urgent blood request sent successfully!' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export default router;
