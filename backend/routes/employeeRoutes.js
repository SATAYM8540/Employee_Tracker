

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Capture from "../models/Capture.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads/captures");

// Ensure uploads/captures directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads/captures folder");
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}-${Date.now()}.jpg`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 🧩 Capture snapshot
router.post("/capture", protect, upload.single("captureImage"), async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageUrl = `/uploads/captures/${req.file.filename}`;

    // Save in MongoDB
    const capture = new Capture({
      employeeId: req.user._id,
      url: imageUrl,
      timestamp: new Date(),
    });
    await capture.save();

    console.log("📸 Snapshot saved:", imageUrl);
    res.json({ message: "Snapshot saved successfully", imageUrl });
  } catch (err) {
    console.error("❌ Snapshot save error:", err);
    res.status(500).json({ error: "Failed to save snapshot" });
  }
});

// 🧩 Logout + Attendance Record
router.post("/logout", protect, async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = "offline";
    user.latestLogout = new Date();

    const lastLogin = user.latestLogin;
    const now = new Date();
    const diffSeconds = Math.floor((now - lastLogin) / 1000);

    const attendance = new Attendance({
      employeeId: user._id,
      loginTime: lastLogin,
      logoutTime: now,
      durationSeconds: diffSeconds,
    });
    await attendance.save();
    await user.save();

    console.log(`🕒 Attendance recorded for ${user.name}`);
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
