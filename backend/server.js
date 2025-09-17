
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import trackRoutes from "./routes/track.js";
import adminRoutes from "./routes/admin.js";
import streamRoutes from "./routes/stream.js";
import User from "./models/User.js";
import Attendance from "./models/Attendance.js";

dotenv.config();
// const path =  require('path');


const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { cors: { origin: "*" } });
app.set("io", io);

app.use(cors());
app.use(express.json());

// Maps
const employees = new Map(); // userId -> socketId
const admins = new Map();    // userId -> socketId

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Register user
  socket.on("register", async ({ userId, role }) => {
    socket.userId = userId;
    socket.role = role;

    if (role === "employee") employees.set(String(userId), socket.id);
    if (role === "admin") admins.set(String(userId), socket.id);

    try {
      if (role === "employee") {
        const user = await User.findById(userId);
        if (user) {
          user.status = "online";
          user.lastLogin = user.lastLogin || new Date();
          await user.save();

          // Notify all admins
          for (const adminSocketId of admins.values()) {
            io.to(adminSocketId).emit("user-status", {
              userId: String(userId),
              status: "online",
              lastLogin: user.lastLogin,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Admin requests employee stream
  socket.on("request-stream", ({ employeeId }) => {
    const empSocketId = employees.get(String(employeeId));
    if (empSocketId) {
      io.to(empSocketId).emit("request-stream", { adminSocketId: socket.id });
    }
  });

  // WebRTC signaling
  socket.on("webrtc-offer", ({ adminSocketId, offer }) => {
    io.to(adminSocketId).emit("webrtc-offer", {
      offer,
      fromSocketId: socket.id,
      userId: socket.userId,
    });
  });

  socket.on("webrtc-answer", ({ toSocketId, answer }) => {
    io.to(toSocketId).emit("webrtc-answer", { answer });
  });

  socket.on("webrtc-ice", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc-ice", { candidate });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    try {
      if (socket.role === "employee") {
        employees.delete(String(socket.userId));
        const user = await User.findById(socket.userId);
        if (user) {
          user.status = "offline";
          await user.save();
        }

        for (const adminSocketId of admins.values()) {
          io.to(adminSocketId).emit("user-status", {
            userId: socket.userId,
            status: "offline",
          });
        }

        const att = await Attendance.findOne({ user: socket.userId, logoutTime: null }).sort({ loginTime: -1 });
        if (att) {
          att.logoutTime = new Date();
          att.durationSeconds = Math.floor((att.logoutTime - att.loginTime) / 1000);
          await att.save();
        }
      }

      if (socket.role === "admin") {
        admins.delete(String(socket.userId));
      }

    } catch (err) {
      console.error(err);
    }

    console.log("Socket disconnected:", socket.id);
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stream", streamRoutes);

app.get("/", (req, res) => res.send("TrackNova API"));



const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error("Mongo error", err));
