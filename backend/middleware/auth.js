// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const header = req.headers.authorization;
//     let token = null;
//     if (header && header.startsWith("Bearer ")) token = header.split(" ")[1];
//     if (!token && req.body?.token) token = req.body.token;
//     if (!token) return res.status(401).json({ error: "No token provided" });
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id).select("-password");
//     if (!user) return res.status(401).json({ error: "Invalid token" });
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("auth error", err);
//     res.status(401).json({ error: "Unauthorized" });
//   }
// };




import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};
