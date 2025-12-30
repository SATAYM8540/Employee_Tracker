
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Capture from "../models/Capture.js";

const router = express.Router();

// ✅ Fetch all employees (for admin/superuser)
router.get("/employees", protect, async (req, res) => {
  try {
    if (!["admin", "superuser"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const employees = await User.find({
      role: { $in: ["employee", "admin"] },
    }).select("-password");

    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// ✅ Get attendance (login/logout history) for a specific employee
router.get("/attendance/all-captures/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superuser"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const records = await Attendance.find({ employeeId: id })
      .sort({ loginTime: -1 })
      .select("loginTime logoutTime durationSeconds");

    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// ✅ Fetch all snapshots for a specific employee
router.get("/attendance/snapshots/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superuser"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;

    const captures = await Capture.find({ employeeId: id })
      .sort({ timestamp: -1 })
      .select("url timestamp employeeId");

    // Format each snapshot with employee details and readable timestamp
    const formatted = captures.map((c) => ({
      _id: c._id,
      url: c.url,
      timestamp: c.timestamp,
      employee: c.employeeId
        ? { name: c.employeeId.name, email: c.employeeId.email, role: c.employeeId.role }
        : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching snapshots:", err);
    res.status(500).json({ error: "Failed to load snapshots" });
  }
});

// ✅ Delete snapshot (only for superuser)
router.delete("/attendance/capture/:empId/:captureId", protect, async (req, res) => {
  try {
    if (req.user.role !== "superuser") {
      return res.status(403).json({ error: "Only superuser can delete snapshots" });
    }

    const { empId, captureId } = req.params;
    const capture = await Capture.findOneAndDelete({
      _id: captureId,
      employeeId: empId,
    });

    if (!capture) return res.status(404).json({ error: "Capture not found" });

    res.json({ message: "Snapshot deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting snapshot:", err);
    res.status(500).json({ error: "Failed to delete snapshot" });
  }
});

export default router;
