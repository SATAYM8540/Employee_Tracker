// import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   loginTime: { type: Date, default: Date.now },
//   logoutTime: Date,
//   durationSeconds: Number,
//   isLate: { type: Boolean, default: false },
//   notifiedLate: { type: Boolean, default: false },
//   anomalyEvents: [{ at: Date, type: String, note: String, confidence: Number }]
// }, { timestamps: true });

// export default mongoose.model("Attendance", attendanceSchema);



import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
  durationSeconds: { type: Number }
});

export default mongoose.model("Attendance", attendanceSchema);
