import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import GuestMessage from "../models/guestMessage.models.js";
import { io } from "../lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../../uploads");

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
    const { guestName, fileName, fileType, fileData } = req.body;
    if (!guestName?.trim()) {
      return res.status(400).json({ message: "Guest name is required" });
    }
    if (!fileData || !fileName) {
      return res.status(400).json({ message: "File data is required" });
    }

    const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const buffer = Buffer.from(base64Data, "base64");

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFilename = `${Date.now()}-${safeFileName}`;
    await fs.promises.writeFile(path.join(uploadsDir, uniqueFilename), buffer);

    const newMessage = new GuestMessage({
      senderName: guestName.trim().slice(0, 50),
      fileUrl: `/uploads/${uniqueFilename}`,
      fileName,
      fileType,
    });
    await newMessage.save();
    io.to("guest-room").emit("newGuestMessage", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in uploadFile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
