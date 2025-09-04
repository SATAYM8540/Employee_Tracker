import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Optional: clear old users
    await User.deleteMany({});

    // Hash passwords
    const hashedAdmin = await bcrypt.hash("Admin123", 10);
    const hashedEmp1 = await bcrypt.hash("Employee123", 10);
    const hashedEmp2 = await bcrypt.hash("Employee456", 10);

    // Insert default users
    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@tracknova.com",
        password: hashedAdmin,
        role: "admin",
      },
      {
        name: "Employee One",
        email: "emp1@tracknova.com",
        password: hashedEmp1,
        role: "employee",
      },
      {
        name: "Employee Two",
        email: "emp2@tracknova.com",
        password: hashedEmp2,
        role: "employee",
      },
    ]);

    console.log("✅ Default users inserted:", users);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
