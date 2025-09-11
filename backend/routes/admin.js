// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";
// import User from "../models/User.js";
// import Attendance from "../models/Attendance.js";
// const router = express.Router();

// router.get("/employees", authMiddleware(["admin"]), async (req, res) => {
//   try {
//     const users = await User.find().select("-password").lean();
//     const populated = await Promise.all(users.map(async u => {
//       const latest = await Attendance.findOne({ user: u._id }).sort({ loginTime: -1 });
//       return { ...u, latestLogin: latest?.loginTime || null, latestLogout: latest?.logoutTime || null };
//     }));
//     res.json(populated);
//   } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
// });

// router.get("/attendance", authMiddleware(["admin"]), async (req, res) => {
//   try {
//     const logs = await Attendance.find().populate("user", "name email role").sort({ loginTime: -1 });
//     res.json(logs);
//   } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
// });

// export default router;



// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";
// import User from "../models/User.js";
// import Attendance from "../models/Attendance.js";

// const router = express.Router();

// // 🔹 Employees list with latest login/logout & duration
// router.get("/employees", authMiddleware(["admin"]), async (req, res) => {
//   try {
//     const users = await User.find().select("-password").lean();

//     const populated = await Promise.all(
//       users.map(async (u) => {
//         const latest = await Attendance.findOne({ user: u._id })
//           .sort({ loginTime: -1 })
//           .lean();

//         let durationSeconds = null;

//         if (latest) {
//           if (latest.logoutTime) {
//             // finished session
//             durationSeconds = latest.durationSeconds;
//           } else {
//             // still online → live duration
//             durationSeconds = Math.floor(
//               (Date.now() - new Date(latest.loginTime)) / 1000
//             );
//           }
//         }

//         return {
//           ...u,
//           latestLogin: latest?.loginTime || null,
//           latestLogout: latest?.logoutTime || null,
//           durationSeconds,
//         };
//       })
//     );

//     res.json(populated);
//   } catch (err) {
//     console.error("Error fetching employees:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 🔹 Full attendance logs
// router.get("/attendance", authMiddleware(["admin"]), async (req, res) => {
//   try {
//     const logs = await Attendance.find()
//       .populate("user", "name email role")
//       .sort({ loginTime: -1 });
//     res.json(logs);
//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;




import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// 🔹 Get all employees with latest login/logout
router.get("/employees", authMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    const populated = await Promise.all(
      users.map(async (u) => {
        const latest = await Attendance.findOne({ user: u._id }).sort({
          loginTime: -1,
        });
        return {
          ...u,
          latestLogin: latest?.loginTime || null,
          latestLogout: latest?.logoutTime || null,
        };
      })
    );
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get raw attendance logs
router.get("/attendance", authMiddleware(["admin"]), async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate("user", "name email role")
      .sort({ loginTime: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// 🔹 Get history logs of a specific employee
router.get("/attendance/:userId", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await Attendance.find({ user: userId })
      .populate("user", "name email")
      .sort({ loginTime: -1 });

    res.json(logs);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// 🔹 Get weekly/monthly grouped report
router.get("/attendance/report", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { range = "week" } = req.query;

    const now = new Date();
    let startDate;

    if (range === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (range === "month") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    } else {
      return res.status(400).json({ error: "Invalid range" });
    }

    const logs = await Attendance.find({ loginTime: { $gte: startDate } })
      .populate("user", "name email role")
      .sort({ loginTime: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
