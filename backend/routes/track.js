// import express from "express";
// import Attendance from "../models/Attendance.js";
// import User from "../models/User.js";
// import { authMiddleware } from "../middleware/auth.js";
// import { sendAdminEmail } from "../utils/mailer.js";
// import { notifySlack, notifyTeams } from "../utils/notify.js";

// const router = express.Router();

// router.post("/checkin", authMiddleware, async (req, res) => {
//   try {
//     const attendance = await Attendance.create({ user: req.user._id, loginTime: new Date() });
//     await User.findByIdAndUpdate(req.user._id, { isOnline: true, lastSeen: new Date() });

//     // late check
//     try {
//       const expected = req.user.expectedStartTime || "09:30";
//       const [eh, em] = expected.split(":").map(Number);
//       const login = attendance.loginTime;
//       const expectedDate = new Date(login);
//       expectedDate.setHours(eh, em, 0, 0);
//       if (login > expectedDate) {
//         attendance.isLate = true;
//         await attendance.save();
//         if (!attendance.notifiedLate) {
//           attendance.notifiedLate = true;
//           await attendance.save();
//           sendAdminEmail(`${req.user.name} is late`, `${req.user.name} checked in at ${login.toLocaleString()}`, `<p>${req.user.name} checked in at ${login.toLocaleString()}</p>`).catch(console.error);
//           await notifySlack(process.env.SLACK_WEBHOOK_URL, `${req.user.name} is late: ${login.toLocaleString()}`);
//           await notifyTeams(process.env.TEAMS_WEBHOOK_URL, `${req.user.name} is late: ${login.toLocaleString()}`);
//         }
//       }
//     } catch (err) { console.error("late-check err", err); }

//     const io = req.app.get("io");
//     io?.emit("user-status", { userId: String(req.user._id), isOnline: true, lastSeen: new Date() });
//     io?.emit("attendance-created", { attendanceId: attendance._id, user: { _id: req.user._id, name: req.user.name }, loginTime: attendance.loginTime });

//     res.json({ attendanceId: attendance._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/checkout", authMiddleware, async (req, res) => {
//   try {
//     const { attendanceId } = req.body;
//     let attendance;
//     if (attendanceId) attendance = await Attendance.findById(attendanceId);
//     else attendance = await Attendance.findOne({ user: req.user._id, logoutTime: null }).sort({ loginTime: -1 });
//     if (!attendance) return res.status(404).json({ error: "Attendance not found" });

//     attendance.logoutTime = new Date();
//     attendance.durationSeconds = Math.floor((attendance.logoutTime - attendance.loginTime) / 1000);
//     await attendance.save();

//     await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: attendance.logoutTime });
//     const io = req.app.get("io");
//     io?.emit("user-status", { userId: String(req.user._id), isOnline: false, lastSeen: attendance.logoutTime });
//     io?.emit("attendance-closed", { attendanceId: attendance._id, userId: String(req.user._id), logoutTime: attendance.logoutTime, durationSeconds: attendance.durationSeconds });

//     await notifySlack(process.env.SLACK_WEBHOOK_URL, `${req.user.name} checked out at ${attendance.logoutTime.toLocaleString()}`);
//     await notifyTeams(process.env.TEAMS_WEBHOOK_URL, `${req.user.name} checked out at ${attendance.logoutTime.toLocaleString()}`);

//     res.json({ attendance });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/heartbeat", authMiddleware, async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date(), isOnline: true });
//     const io = req.app.get("io");
//     io?.emit("user-status", { userId: String(req.user._id), isOnline: true, lastSeen: new Date() });
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/anomaly", authMiddleware, async (req, res) => {
//   try {
//     const { attendanceId, type, note, confidence } = req.body;
//     const att = await Attendance.findById(attendanceId);
//     if (!att) return res.status(404).json({ error: "Attendance not found" });
//     att.anomalyEvents.push({ at: new Date(), type, note, confidence });
//     await att.save();
//     req.app.get("io")?.emit("anomaly", { userId: String(req.user._id), attendanceId, type, note, confidence, at: new Date() });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;





import express from "express";
import Attendance from "../models/Attendance.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Employee check-in
router.post("/checkin", authMiddleware(["employee"]), async (req, res) => {
  const existing = await Attendance.findOne({
    user: req.user.id,
    logoutTime: null
  });
  if (existing) return res.status(400).json({ error: "Already checked in" });

  const log = await Attendance.create({
    user: req.user.id,
    loginTime: new Date()
  });

  res.json(log);
});

// Employee check-out
router.post("/checkout", authMiddleware(["employee"]), async (req, res) => {
  const log = await Attendance.findOne({
    user: req.user.id,
    logoutTime: null
  });
  if (!log) return res.status(400).json({ error: "Not checked in" });

  log.logoutTime = new Date();
  log.durationSeconds =
    (log.logoutTime.getTime() - log.loginTime.getTime()) / 1000;
  await log.save();

  res.json(log);
});

// Employee history
router.get("/history", authMiddleware(["employee"]), async (req, res) => {
  const logs = await Attendance.find({ user: req.user.id }).sort({ loginTime: -1 });
  res.json(logs);
});

export default router;
