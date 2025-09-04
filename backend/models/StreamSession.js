import mongoose from "mongoose";

const streamSessionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ["active", "stopped"], default: "active" }
});

export default mongoose.model("StreamSession", streamSessionSchema);
