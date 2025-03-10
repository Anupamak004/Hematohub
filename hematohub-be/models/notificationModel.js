import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
