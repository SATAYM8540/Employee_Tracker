import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import StreamSession from "../models/StreamSession.js";
const router = express.Router();

router.post("/start", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ error: "employeeId required" });
    const s = await StreamSession.create({ employee: employeeId, admin: req.user._id, startedAt: new Date(), status: "active" });
    res.json({ session: s });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

router.post("/stop", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const s = await StreamSession.findById(sessionId);
    if (!s) return res.status(404).json({ error: "Session not found" });
    s.status = "stopped";
    s.endedAt = new Date();
    await s.save();
    res.json({ session: s });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
