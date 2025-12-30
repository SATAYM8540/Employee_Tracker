

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Capture from "../models/Capture.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

/**
 * Helper: build absolute URL for an upload path (handles proxies/local)
 * e.g. "/uploads/captures/1-123.jpg" -> "http(s)://host/uploads/captures/1-123.jpg"
 */
function buildAbsoluteUrl(req, relativePath) {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith("http")) return relativePath;
  const proto = req.protocol;
  const host = req.get("host"); // includes port if present
  return `${proto}://${host}${relativePath}`;
}

/**
 * GET /all-snapshots/:employeeId
 * Returns list of Capture docs for an employee (new route frontend expects)
 * Only accessible to admin or superuser
 */
router.get("/all-snapshots/:employeeId", protect, async (req, res) => {
  try {
    if (!["admin", "superuser"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { employeeId } = req.params;
    const captures = await Capture.find({ employeeId }).sort({ timestamp: -1 }).lean();

    // convert urls to absolute
    const mapped = captures.map((c) => ({
      ...c,
      url: buildAbsoluteUrl(req, c.url),
    }));

    res.json(mapped);
  } catch (err) {
    console.error("❌ Error in /all-snapshots:", err);
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
});

/**
 * BACKWARDS-COMPAT: existing route that returns capture docs (kept)
 * GET /all-captures/:id
 */
router.get("/all-captures/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superuser"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const captures = await Capture.find({ employeeId: req.params.id }).sort({ timestamp: -1 }).lean();
    const mapped = captures.map((c) => ({ ...c, url: buildAbsoluteUrl(req, c.url) }));
    res.json(mapped);
  } catch (err) {
    console.error("❌ Error in /all-captures:", err);
    res.status(500).json({ error: "Failed to load captures" });
  }
});

/**
 * DELETE /capture/:employeeId/:captureId
 * Only superuser allowed to delete snapshots (keeps your previous restriction)
 */
router.delete("/capture/:employeeId/:captureId", protect, async (req, res) => {
  try {
    if (req.user.role !== "superuser") {
      return res.status(403).json({ error: "Only superuser can delete snapshots" });
    }

    const { captureId } = req.params;
    const deleted = await Capture.findByIdAndDelete(captureId);

    if (!deleted) return res.status(404).json({ error: "Capture not found" });

    res.json({ message: "Capture deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting capture:", err);
    res.status(500).json({ error: "Failed to delete capture" });
  }
});

/**
 * GET /history/:id
 * Attendance history for given employee
 */
router.get("/history/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superuser", "employee"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const history = await Attendance.find({ employeeId: req.params.id }).sort({ loginTime: -1 });
    res.json(history);
  } catch (err) {
    console.error("❌ Error in /history:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

export default router;
