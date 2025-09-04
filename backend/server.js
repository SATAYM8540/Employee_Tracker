// // import express from "express";
// // import http from "http";
// // import { Server } from "socket.io";
// // import mongoose from "mongoose";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";

// // import authRoutes from "./routes/auth.js";
// // import trackRoutes from "./routes/track.js";
// // import adminRoutes from "./routes/admin.js";
// // import employeeRoutes from "./routes/employee.js";
// // import User from "./models/User.js";

// // dotenv.config();

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, { cors: { origin: "*" } });

// // app.set("io", io);
// // app.use(cors());
// // app.use(express.json());

// // // REST routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/track", trackRoutes);
// // app.use("/api/admin", adminRoutes);
// // app.use("/api/employee", employeeRoutes);

// // app.get("/", (req, res) => res.send("TrackNova API running"));

// // // Socket authentication middleware (verify JWT passed in handshake.auth.token)
// // io.use(async (socket, next) => {
// //   try {
// //     const token = socket.handshake.auth?.token;
// //     if (!token) return next();
// //     const payload = jwt.verify(token, process.env.JWT_SECRET);
// //     const user = await User.findById(payload.id).select("-password");
// //     if (user) {
// //       socket.user = { _id: String(user._id), role: user.role, email: user.email, name: user.name };
// //       // join a room with userId so server can easily message the user
// //       socket.join(String(user._id));
// //     }
// //     return next();
// //   } catch (err) {
// //     console.warn("socket auth failed", err.message);
// //     return next(); // allow connection even without auth, but socket.user will be undefined
// //   }
// // });

// // io.on("connection", (socket) => {
// //   console.log("Socket connected", socket.id, "user:", socket.user?.email || "unknown");

// //   // Admin asks server to request stream from employee (employeeId = user._id)
// //   socket.on("request-stream", ({ employeeId }) => {
// //     // optionally check that socket.user.role === 'admin'
// //     if (socket.user?.role !== "admin") {
// //       console.warn("Non-admin attempted request-stream", socket.id);
// //       return;
// //     }
// //     // send to room of employeeId. server includes adminSocketId so employee can respond to it
// //     io.to(employeeId).emit("start-stream", { fromSocketId: socket.id });
// //     console.log(`Admin ${socket.id} requested stream from ${employeeId}`);
// //   });

// //   // Relay offer -> audience: data = { toSocketId, fromSocketId, sdp }
// //   socket.on("offer", (data) => {
// //     if (!data?.toSocketId) return;
// //     io.to(data.toSocketId).emit("offer", { fromSocketId: socket.id, sdp: data.sdp });
// //   });

// //   // Relay answer -> data { toSocketId, sdp }
// //   socket.on("answer", (data) => {
// //     if (!data?.toSocketId) return;
// //     io.to(data.toSocketId).emit("answer", { fromSocketId: socket.id, sdp: data.sdp });
// //   });

// //   // Relay ICE candidate -> data { toSocketId, candidate }
// //   socket.on("candidate", (data) => {
// //     if (!data?.toSocketId) return;
// //     io.to(data.toSocketId).emit("candidate", { fromSocketId: socket.id, candidate: data.candidate });
// //   });

// //   socket.on("disconnect", () => {
// //     console.log("Socket disconnected", socket.id);
// //   });
// // });

// // // Connect DB, seed demo accounts, start server
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(async () => {
// //     console.log("MongoDB connected");
// //     // seed demo accounts (idempotent)
// //     try {
// //       const admin = await User.findOne({ email: "admin@company.com" });
// //       if (!admin) {
// //         const h = await bcrypt.hash("Admin123", 10);
// //         await User.create({ name: "Admin", email: "admin@company.com", password: h, role: "admin" });
// //         console.log("Created demo admin admin@company.com / Admin123");
// //       }
// //       const emp = await User.findOne({ email: "employee@company.com" });
// //       if (!emp) {
// //         const h = await bcrypt.hash("Employee123", 10);
// //         await User.create({ name: "Employee", email: "employee@company.com", password: h, role: "employee" });
// //         console.log("Created demo employee employee@company.com / Employee123");
// //       }
// //     } catch (e) { console.warn("seeding err", e.message); }

// //     const port = process.env.PORT || 5000;
// //     server.listen(port, () => console.log(`Server listening on ${port}`));
// //   })
// //   .catch(err => console.error("Mongo connect err", err));



// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import authRoutes from "./routes/auth.js";
// import trackRoutes from "./routes/track.js";
// import adminRoutes from "./routes/admin.js";
// import employeeRoutes from "./routes/employee.js";
// import User from "./models/User.js";
// import Attendance from "./models/Attendance.js";
// import bcrypt from "bcryptjs";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     seedDefaultUsers();
//   })
//   .catch((err) => console.error("❌ MongoDB error:", err));

// app.use("/api/auth", authRoutes);
// app.use("/api/track", trackRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/employee", employeeRoutes);

// app.get("/", (req, res) => res.send("TrackNova API Running"));

// app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

// async function seedDefaultUsers() {
//   try {
//     const existingAdmin = await User.findOne({ email: "admin@tracknova.com" });
//     if (!existingAdmin) {
//       const hash = await bcrypt.hash("Admin123", 10);
//       await User.create({
//         name: "Super Admin",
//         email: "admin@tracknova.com",
//         password: hash,
//         role: "admin"
//       });
//       console.log("✅ Default Admin created: admin@tracknova.com / Admin123");
//     }

//     const employees = [
//       { name: "Alice Employee", email: "alice@tracknova.com", password: "Employee123" },
//       { name: "Bob Employee", email: "bob@tracknova.com", password: "Employee123" },
//       { name: "Charlie Employee", email: "charlie@tracknova.com", password: "Employee123" }
//     ];

//     for (const emp of employees) {
//       let user = await User.findOne({ email: emp.email });
//       if (!user) {
//         const hash = await bcrypt.hash(emp.password, 10);
//         user = await User.create({ name: emp.name, email: emp.email, password: hash, role: "employee" });
//         console.log(`👤 Employee created: ${emp.email} / ${emp.password}`);
//       }

//       const existingLogs = await Attendance.find({ user: user._id });
//       if (existingLogs.length === 0) {
//         const today = new Date();
//         const yesterday = new Date(today);
//         yesterday.setDate(today.getDate() - 1);

//         await Attendance.create({
//           user: user._id,
//           loginTime: new Date(yesterday.setHours(9, 0, 0)),
//           logoutTime: new Date(yesterday.setHours(17, 30, 0)),
//           durationSeconds: 8.5 * 3600
//         });

//         await Attendance.create({
//           user: user._id,
//           loginTime: new Date(today.setHours(9, 15, 0)),
//           logoutTime: null
//         });

//         console.log(`📝 Attendance logs created for ${emp.name}`);
//       }
//     }
//   } catch (err) {
//     console.error("❌ Seeding error:", err);
//   }
// }




import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import trackRoutes from "./routes/track.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: { origin: "*" }
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ New client connected", socket.id);

  socket.on("register", ({ userId, role }) => {
    socket.userId = userId;
    socket.role = role;
    console.log(`User ${userId} (${role}) registered on socket`);
  });

  // Forward stream requests from admin to employee
  socket.on("request-stream", (employeeId) => {
    console.log(`Admin requested stream from ${employeeId}`);
    io.to(employeeId).emit("request-stream");
  });

  // Employee sends WebRTC offer → forward to admin
  socket.on("webrtc-offer", ({ adminId, offer }) => {
    io.to(adminId).emit("webrtc-offer", { employeeId: socket.userId, offer });
  });

  // Admin sends WebRTC answer → forward to employee
  socket.on("webrtc-answer", ({ employeeId, answer }) => {
    io.to(employeeId).emit("webrtc-answer", { answer });
  });

  // ICE candidates forwarding
  socket.on("webrtc-ice-candidate", ({ targetId, candidate }) => {
    io.to(targetId).emit("webrtc-ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected", socket.id);
  });
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => res.send("TrackNova API running"));
app.use("/api/auth", authRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
