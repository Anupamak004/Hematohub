import Hospital from "../models/hospital.js";

// 📌 Add Donated Blood & Reduce Stock
export const addDonatedBlood = async (req, res) => {
  try {
    const { recipientName, bloodType, date, units } = req.body;
    const hospitalId = req.hospital.id;

    if (!recipientName || !bloodType || !date || !units) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Reduce blood stock
    if (!hospital.bloodStock[bloodType] || hospital.bloodStock[bloodType] < units) {
      return res.status(400).json({ message: "Not enough blood stock available." });
    }

    hospital.bloodStock[bloodType] -= units;

    // Save donation record
    hospital.donatedBlood.push({ recipientName, bloodType, date, units });

    await hospital.save();
    res.status(201).json({ message: "Donation added successfully", hospital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Add Received Blood & Increase Stock
export const addReceivedBlood = async (req, res) => {
  try {
    const { receivedFrom, bloodType, date, units } = req.body;
    const hospitalId = req.hospital.id;

    if (!receivedFrom || !bloodType || !date || !units) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Increase blood stock
    hospital.bloodStock[bloodType] = (hospital.bloodStock[bloodType] || 0) + units;

    // Save received blood record
    hospital.receivedBlood.push({ receivedFrom, bloodType, date, units });

    await hospital.save();
    res.status(201).json({ message: "Received blood added successfully", hospital });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
