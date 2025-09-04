import express from "express";
import { startStream, stopStream } from "../controllers/StreamController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can start/stop employee stream
router.post("/start", authMiddleware(["admin"]), startStream);
router.post("/stop", authMiddleware(["admin"]), stopStream);

export default router;
