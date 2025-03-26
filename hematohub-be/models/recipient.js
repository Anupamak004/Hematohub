import mongoose from "mongoose";
import Hospital from "./hospital.js";

const recipientSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  bloodType: { type: String, required: true },
  date: { type: String, required: true },
  units: { type: Number, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: Hospital, required: true },
});

const Recipient = mongoose.model("Recipient", recipientSchema);
export default Recipient;
