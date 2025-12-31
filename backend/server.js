

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import seedSuperuser from "./utils/seedSuperuser.js";
import { startCleanupJob } from "./utils/cleanupSnapshots.js";

import authRoutes from "./routes/authRoutes.js";
import superuserRoutes from "./routes/superuserRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    `${process.env.FRONTEND_URL} || http://localhost:5173`,          
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));

connectDB();
seedSuperuser();
startCleanupJob(); // 🔁 Auto cleanup every 24h

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/superuser", superuserRoutes);
app.use("/admin", adminRoutes);
app.use("/employee", employeeRoutes);
app.use("/admin/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


