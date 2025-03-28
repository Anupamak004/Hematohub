
import mongoose from "mongoose";

const receivedBloodSchema = new mongoose.Schema({
  receivedFrom: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  receivedDate: { type: Date, default: Date.now }
});

const ReceivedBlood = mongoose.model("ReceivedBlood", receivedBloodSchema);
export default ReceivedBlood;
