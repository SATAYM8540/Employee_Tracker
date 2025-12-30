import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Capture from "../models/Capture.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads/captures");

const deleteFileSafe = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (err) {
      console.error("Error deleting file:", err.message);
    }
  }
};

const cleanupSnapshots = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldCaptures = await Capture.find({ timestamp: { $lt: sevenDaysAgo } });

    if (oldCaptures.length === 0) {
      console.log("✅ No old captures found for cleanup.");
      return;
    }

    console.log(`🧹 Cleaning ${oldCaptures.length} old captures...`);

    for (const capture of oldCaptures) {
      const filePath = path.join(uploadsDir, path.basename(capture.url));
      deleteFileSafe(filePath);
      await Capture.findByIdAndDelete(capture._id);
    }

    console.log("✅ Old captures cleaned successfully!");
  } catch (err) {
    console.error("❌ Error cleaning old captures:", err.message);
  }
};

export const startCleanupJob = () => {
  console.log("🕓 Auto cleanup job started (runs every 24 hours)");
  cleanupSnapshots();
  setInterval(cleanupSnapshots, 24 * 60 * 60 * 1000);
};
