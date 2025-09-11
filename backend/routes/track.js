import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Attendance from "../models/Attendance.js";
const router = express.Router();

router.post("/checkin", authMiddleware(["employee"]), async (req, res) => {
  try {
    const att = await Attendance.create({ user: req.user._id, loginTime: new Date() });
    req.user.status = "online";
    req.user.lastLogin = new Date();
    await req.user.save();
    res.json(att);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

router.post("/checkout", authMiddleware(["employee"]), async (req, res) => {
  try {
    const att = await Attendance.findOne({ user: req.user._id, logoutTime: null }).sort({ loginTime: -1 });
    if (!att) return res.status(404).json({ error: "No active attendance" });
    att.logoutTime = new Date();
    att.durationSeconds = Math.floor((att.logoutTime - att.loginTime)/1000);
    await att.save();
    req.user.status = "offline";
    await req.user.save();
    res.json(att);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

router.get("/history", authMiddleware(["employee","admin"]), async (req, res) => {
  try {
    const logs = await Attendance.find({ user: req.user._id }).sort({ loginTime: -1 });
    res.json(logs);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;





// import express from "express";
// import Attendance from "../models/Attendance.js";

// const router = express.Router();

// // Employee login → mark login time
// router.post("/login", async (req, res) => {
//   try {
//     const { email } = req.body;

//     const attendance = new Attendance({
//       email,
//       loginTime: new Date(),
//       status: "online"
//     });

//     await attendance.save();
//     res.json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to log attendance" });
//   }
// });

// // Employee logout → update logout time
// router.post("/logout", async (req, res) => {
//   try {
//     const { email } = req.body;

//     const attendance = await Attendance.findOne({ email, status: "online" }).sort({ loginTime: -1 });
//     if (!attendance) return res.status(404).json({ error: "No active session found" });

//     attendance.logoutTime = new Date();
//     attendance.status = "offline";
//     await attendance.save();

//     res.json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update logout" });
//   }
// });

// // Admin → get all logs
// router.get("/history", async (req, res) => {
//   try {
//     const logs = await Attendance.find().sort({ loginTime: -1 });
//     res.json(logs);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// export default router;
