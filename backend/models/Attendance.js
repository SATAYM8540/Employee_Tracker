import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date, default: null },
  durationSeconds: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);


