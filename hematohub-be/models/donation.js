
import mongoose from "mongoose";

const receivedBloodSchema = new mongoose.Schema({
  receivedFrom: { type: String, required: true },
  bloodType: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  units: { type: Number, required: true },
  dob: { type: Date, required: true }, // Store full date
  aadhaarLast4: { type: String, required: true, match: /^\d{4}$/ }, // Only last 4 digits
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true }
});

const ReceivedBlood = mongoose.model("ReceivedBlood", receivedBloodSchema);
export default ReceivedBlood;
