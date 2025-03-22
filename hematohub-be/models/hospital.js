import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const hospitalSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  hospitalType: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  alternatePhone: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: String },
  longitude: { type: String },
  licenseNumber: { type: String, required: true, unique: true },
  bloodStock: { type: Object, default: {} },
  website: { type: String },
  operatingHours: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  donatedBlood: { type: Array, default: [] },  // New field for donated blood records
  receivedBlood: { type: Array, default: [] },
  bloodThreshold: {
    type: Object,
    default: { "A+": 5, "A-": 5, "B+": 5, "B-": 5, "AB+": 5, "AB-": 5, "O+": 5, "O-": 5 },
  }, 
});

// Encrypt password before saving
hospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Hospital", hospitalSchema);
