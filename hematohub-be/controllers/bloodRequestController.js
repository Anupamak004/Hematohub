import BloodRequest from "../models/bloodRequestModel.js";

// Get all blood requests for a hospital
export const getBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ hospitalId: req.hospital.id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Submit a new blood request
export const submitBloodRequest = async (req, res) => {
  try {
    const { bloodType, quantity, urgency } = req.body;

    const newRequest = await BloodRequest.create({
      hospitalId: req.hospital.id,
      bloodType,
      quantity,
      urgency,
      status: "Pending",
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
