import StreamSession from "../models/StreamSession.js";

export const startStream = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const newSession = new StreamSession({
      employee: employeeId,
      status: "active"
    });
    await newSession.save();

    res.json({ message: "Stream started", session: newSession });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const stopStream = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await StreamSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "stopped";
    session.endedAt = new Date();
    await session.save();

    res.json({ message: "Stream stopped", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
