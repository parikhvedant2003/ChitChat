import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
export const getUserForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -__v");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSideBar Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessagesForUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    if (!receiverId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate("senderId", "_id profilePicture fullName")
      .populate("receiverId", "_id profilePicture fullName");
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessagesForUser Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    if (!receiverId || (!text && !image)) {
      return res
        .status(400)
        .json({ message: "User ID and Message are required" });
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      if (!uploadResponse) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });

    await newMessage
      .populate([
        { path: "senderId", select: "_id profilePicture fullName" },
        { path: "receiverId", select: "_id profilePicture fullName" },
      ])
      .then((newMessage) => {
        return {
          ...newMessage.toObject(),
          type: "newMessage",
        };
      });
    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    console.log("Emitting newMessage to receiver:", receiverSocketId);
    console.log("New message data:", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
