import express from "express";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: Infinity }));
app.use(express.urlencoded({ limit: Infinity, extended: true }));
app.use(cookieParser()); // Middleware to parse cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow requests from the client URL
    credentials: true, // Allow credentials (cookies) to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers in requests
  })
); // Middleware to enable CORS

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/guest", guestRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectDB();
});
