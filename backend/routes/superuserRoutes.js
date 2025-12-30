

import express from "express";
import User from "../models/User.js";
import { protect, superuserOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all admins + employees
router.get("/employees", protect, superuserOnly, async (req, res) => {
  const users = await User.find({ role: { $ne: "superuser" } }).select("-password");
  res.json(users);
});

// Get one user
router.get("/employees/:id", protect, superuserOnly, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

// Add admin/employee
router.post("/employees", protect, superuserOnly, async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "Email already exists" });

  const newUser = new User({ name, email, password, role });
  await newUser.save();
  res.json({ message: "User added successfully", user: newUser });
});

// Edit user
router.put("/employees/:id", protect, superuserOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;
  user.role = req.body.role || user.role;
  await user.save();

  res.json({ message: "User updated successfully", user });
});

// Delete user
router.delete("/employees/:id", protect, superuserOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted successfully" });
});

export default router;
