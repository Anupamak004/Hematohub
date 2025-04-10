import mongoose from "mongoose";

const receivedBloodSchema = new mongoose.Schema({
  donorType: {
    type: String,
    enum: ["person", "hospital"],
    required: true,
  },
  receivedFrom: { type: String, required: true },
  bloodType: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  units: { type: Number, required: true },
  dob: {
    type: Date,
    required: function () {
      return this.donorType === "person";
    },
  },
  aadhaarLast4: {
    type: String,
    match: /^\d{4}$/,
    required: function () {
      return this.donorType === "person";
    },
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
});

const ReceivedBlood = mongoose.model("ReceivedBlood", receivedBloodSchema);
export default ReceivedBlood;
