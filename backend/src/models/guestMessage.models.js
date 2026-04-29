import mongoose from "mongoose";

const guestMessageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

const GuestMessage = mongoose.model("GuestMessage", guestMessageSchema);
export default GuestMessage;
