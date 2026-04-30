import express from "express";
import { getMessages, sendMessage, uploadFile } from "../controllers/guest.controllers.js";
import { upload } from "../lib/storage.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/send", sendMessage);
router.post("/upload", upload.single("file"), uploadFile);

export default router;
