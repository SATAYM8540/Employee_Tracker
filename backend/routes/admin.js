// import express from "express";
// import Attendance from "../models/Attendance.js";
// import User from "../models/User.js";
// import { authMiddleware } from "../middleware/auth.js";

// const router = express.Router();

// router.get("/users", authMiddleware, async (req, res) => {
//   try {
//     // In production check req.user.role === 'admin'
//     const users = await User.find().select("name email role isOnline lastSeen");
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.get("/attendance", authMiddleware, async (req, res) => {
//   try {
//     const logs = await Attendance.find().sort({ loginTime: -1 }).populate("user", "name email role");
//     res.json(logs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;



import express from "express";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all employees
router.get("/employees", authMiddleware(["admin"]), async (req, res) => {
  const employees = await User.find({ role: "employee" });
  res.json(employees);
});

// Get all attendance logs
router.get("/attendance", authMiddleware(["admin"]), async (req, res) => {
  const logs = await Attendance.find().populate("user").sort({ loginTime: -1 });
  res.json(logs);
});

export default router;
