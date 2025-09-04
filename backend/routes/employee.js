// import express from "express";
// import Attendance from "../models/Attendance.js";
// import { authMiddleware } from "../middleware/auth.js";

// const router = express.Router();

// router.get("/attendance", authMiddleware, async (req, res) => {
//   try {
//     const logs = await Attendance.find({ user: req.user._id }).sort({ loginTime: -1 });
//     res.json(logs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;



import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get profile
router.get("/me", authMiddleware(["employee"]), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

export default router;
