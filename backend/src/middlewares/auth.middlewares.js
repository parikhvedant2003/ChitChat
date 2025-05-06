import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt_token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized Access - No Token Found" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized Access - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized Access - User Not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute Middleware", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
