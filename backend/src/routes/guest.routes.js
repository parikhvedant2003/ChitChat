import express from "express";
import { getMessages, sendMessage, uploadFile } from "../controllers/guest.controllers.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/send", sendMessage);
router.post("/upload", uploadFile);

export default router;
