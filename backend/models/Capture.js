
import mongoose from "mongoose";

const captureSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// ✅ Automatically populate employee info when fetching
captureSchema.pre(/^find/, function (next) {
  this.populate({
    path: "employeeId",
    select: "name email role",
  });
  next();
});

export default mongoose.model("Capture", captureSchema);
