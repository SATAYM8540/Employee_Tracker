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
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { cors: { origin: "*" }});
app.set("io", io);

app.use(cors());
app.use(express.json());

// map userId -> socketId
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("register", async ({ userId }) => {
    socket.userId = userId;
    userSockets.set(String(userId), socket.id);
    try {
      const user = await User.findById(userId);
      if (user) {
        user.status = "online";
        user.lastLogin = user.lastLogin || new Date();
        await user.save();
        io.emit("user-status", { userId: String(userId), status: "online", lastLogin: user.lastLogin });
      }
    } catch (e) { console.error(e); }
  });

  socket.on("request-stream", ({ employeeId, adminSocketId }) => {
    const empSocketId = userSockets.get(String(employeeId));
    if (empSocketId) {
      io.to(empSocketId).emit("request-stream", { adminSocketId });
    }
  });

  socket.on("request-all-streams", ({ adminSocketId }) => {
    for (const [userId, sockId] of userSockets.entries()) {
      io.to(sockId).emit("request-stream", { adminSocketId });
    }
  });

  socket.on("webrtc-offer", ({ adminSocketId, offer }) => {
    io.to(adminSocketId).emit("webrtc-offer", { offer, fromSocketId: socket.id, userId: socket.userId });
  });

  socket.on("webrtc-answer", ({ toSocketId, answer }) => {
    io.to(toSocketId).emit("webrtc-answer", { answer });
  });

  socket.on("webrtc-ice", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc-ice", { candidate });
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      userSockets.delete(String(socket.userId));
      try {
        const user = await User.findById(socket.userId);
        if (user) { user.status = "offline"; await user.save(); io.emit("user-status", { userId: String(socket.userId), status: "offline" }); }
        const att = await Attendance.findOne({ user: socket.userId, logoutTime: null }).sort({ loginTime: -1 });
        if (att) { att.logoutTime = new Date(); att.durationSeconds = Math.floor((att.logoutTime - att.loginTime)/1000); await att.save(); }
      } catch (e) { console.error(e); }
    }
    console.log("Socket disconnected", socket.id);
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




// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import trackRoutes from "./routes/track.js";
// import { Server } from "socket.io";
// import http from "http";

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error(err));

// app.use("/api/track", trackRoutes);

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log("New client:", socket.id);

//   socket.on("employee-stream", ({ id, stream }) => {
//     socket.broadcast.emit("employee-stream", { id, stream });
//   });

//   socket.on("employee-disconnected", (id) => {
//     socket.broadcast.emit("employee-disconnected", id);
//   });

//   socket.on("disconnect", () => {
//     socket.broadcast.emit("employee-disconnected", socket.id);
//   });
// });

// server.listen(5000, () => console.log("Server running on port 5000"));
