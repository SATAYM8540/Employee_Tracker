// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashed, role });
//     res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ error: "Invalid credentials" });
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     user.isOnline = true;
//     user.lastSeen = new Date();
//     await user.save();
//     res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;




import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
