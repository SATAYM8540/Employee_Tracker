import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin","employee"], default: "employee" },
  status: { type: String, enum: ["online","offline"], default: "offline" },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
