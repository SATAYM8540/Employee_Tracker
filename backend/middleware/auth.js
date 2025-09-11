import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: "No token" });
      const token = auth.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ error: "Invalid token" });
      if (roles.length && !roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};
