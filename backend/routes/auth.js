// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import Attendance from "../models/Attendance.js";

// const router = express.Router();

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ error: "Invalid credentials" });

//     user.status = "online";
//     user.lastLogin = new Date();
//     await user.save();

//     const attendance = await Attendance.create({ user: user._id, loginTime: new Date() });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "8h" });
//     res.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//       attendanceId: attendance._id
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/logout", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.json({ ok: true });
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id);
//     if (user) {
//       user.status = "offline";
//       await user.save();
//       const att = await Attendance.findOne({ user: user._1, logoutTime: null }).sort({ loginTime: -1 });
//       // small safety: find by user._id
//       const attendance = await Attendance.findOne({ user: user._id, logoutTime: null }).sort({ loginTime: -1 });
//       if (attendance) {
//         attendance.logoutTime = new Date();
//         attendance.durationSeconds = Math.floor((attendance.logoutTime - attendance.loginTime)/1000);
//         await attendance.save();
//       }
//     }
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.json({ ok: true });
//   }
// });

// export default router;



import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // Update user status + last login
    user.status = "online";
    user.lastLogin = new Date();
    await user.save();

    // Create attendance log
    const attendance = await Attendance.create({
      user: user._id,
      loginTime: new Date(),
    });

    // JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      attendanceId: attendance._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json({ ok: true });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (user) {
      // Set offline
      user.status = "offline";
      await user.save();

      // Find last open attendance
      const attendance = await Attendance.findOne({
        user: user._id,
        logoutTime: null,
      }).sort({ loginTime: -1 });

      if (attendance) {
        attendance.logoutTime = new Date();
        attendance.durationSeconds = Math.floor(
          (attendance.logoutTime - attendance.loginTime) / 1000
        );
        await attendance.save();
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.json({ ok: true });
  }
});

export default router;
