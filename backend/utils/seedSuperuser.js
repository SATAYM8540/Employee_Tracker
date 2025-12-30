

import User from "../models/User.js";

const seedSuperuser = async () => {
  const exists = await User.findOne({ role: "superuser" });
  if (exists) return;

  const superuser = new User({
    name: "Super User",
    email: "superuser@tracknova.com",
    password: "Super123",
    role: "superuser",
  });

  await superuser.save();
  console.log("✅ Default Superuser Created → superuser@tracknova.com / Super123");
};

export default seedSuperuser;
