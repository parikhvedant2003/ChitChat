import GuestMessage from "../models/guestMessage.models.js";
import { io } from "../lib/socket.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await GuestMessage.find()
      .sort({ createdAt: 1 })
      .limit(100);
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { guestName, text } = req.body;
    if (!guestName?.trim()) {
      return res.status(400).json({ message: "Guest name is required" });
    }
    if (!text?.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }
    const newMessage = new GuestMessage({
      senderName: guestName.trim().slice(0, 50),
      text: text.trim(),
    });
    await newMessage.save();
    io.to("guest-room").emit("newGuestMessage", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { guestName } = req.body;
    if (!guestName?.trim()) {
      return res.status(400).json({ message: "Guest name is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newMessage = new GuestMessage({
      senderName: guestName.trim().slice(0, 50),
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
    await newMessage.save();
    io.to("guest-room").emit("newGuestMessage", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in uploadFile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
