

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
