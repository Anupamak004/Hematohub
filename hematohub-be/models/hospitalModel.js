import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const hospitalSchema = mongoose.Schema(
  {
    hospitalName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

// Encrypt password before saving
hospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
