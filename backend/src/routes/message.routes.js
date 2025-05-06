import express from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import {
  getUserForSideBar,
  getMessagesForUser,
  sendMessage,
} from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/users", protectRoute, getUserForSideBar);
router.get("/:id", protectRoute, getMessagesForUser);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
