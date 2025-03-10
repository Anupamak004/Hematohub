import mongoose from "mongoose";

const bloodRequestSchema = mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  bloodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  urgency: { type: String, enum: ["normal", "urgent", "emergency"], required: true },
  status: { type: String, default: "Pending" },
});

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export default BloodRequest;
