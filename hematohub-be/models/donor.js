import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  bloodType: { type: String, required: true },
  hasDisease: { type: Boolean, default: false },
  disease: { type: String, default: "" },
  aadhar: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  hasDonated: {type: Boolean, default: null},
  lastDonation: { type: Date, default: null },
  medications: { type: Boolean, default: null },
  emergency: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  eligibility: { type: Boolean, default: false },// ✅ NEW FIELD (true = Yes, false = No)

  donationHistory: [ // 🆕 NEW FIELD TO STORE HISTORY
    {
      previousDonationDate: { type: Date, required: true },
      nextEligibleDate: { type: Date, required: true }
    }
  ]
});

// Encrypt password before saving
donorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Donor", donorSchema);
