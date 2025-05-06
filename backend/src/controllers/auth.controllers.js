import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, username, email, password } = req.body;
  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email is not valid" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists!" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Error in SignUp Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  User.findOne({
    $or: [{ email: loginId }, { username: loginId }],
  })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found, if you are new, please sign up" });
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Invalid Password, Try Again!" });
        }
        generateToken(user._id, res);
        res.status(200).json({
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        });
      });
    })
    .catch((error) => {
      console.log("Error in Login Controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in Logout Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;
    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilePicture);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
    const imageUrl = uploadResponse.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in Update Profile Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in Check Auth Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
