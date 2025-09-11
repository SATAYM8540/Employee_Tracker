import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  status: { type: String, enum: ["active","stopped"], default: "active" }
});

export default mongoose.model("StreamSession", streamSchema);
