import mongoose from "mongoose";

const donationSchema = mongoose.Schema({
  donorName: { type: String, required: true },
  bloodType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  units: { type: Number, required: true },
});

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
