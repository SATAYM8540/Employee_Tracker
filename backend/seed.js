// // import mongoose from "mongoose";
// // import dotenv from "dotenv";
// // import bcrypt from "bcryptjs";
// // import User from "./models/User.js";
// // import Attendance from "./models/Attendance.js";

// // dotenv.config();

// // async function seed() {
// //   try {
// //     await mongoose.connect(process.env.MONGO_URI);
// //     console.log("Mongo connected");

// //     const adminEmail = "admin@tracknova.com";
// //     const adminPass = "Admin123";
// //     let admin = await User.findOne({ email: adminEmail });
// //     if (!admin) {
// //       admin = await User.create({ name: "Admin", email: adminEmail, password: await bcrypt.hash(adminPass, 10), role: "admin" });
// //       console.log("Admin created:", adminEmail, adminPass);
// //     }

// //     const employees = [
// //       { name: "Alice", email: "emp1@tracknova.com", password: "Employee123" },
// //       { name: "Bob", email: "emp2@tracknova.com", password: "Employee123" },
// //       { name: "Charlie", email: "emp3@tracknova.com", password: "Employee123" },
// //     ];

// //     for (const e of employees) {
// //       let u = await User.findOne({ email: e.email });
// //       if (!u) {
// //         u = await User.create({ name: e.name, email: e.email, password: await bcrypt.hash(e.password, 10), role: "employee" });
// //         console.log("Created", e.email, e.password);
// //       }
// //       const logs = await Attendance.find({ user: u._id });
// //       if (logs.length === 0) {
// //         const today = new Date();
// //         const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
// //         await Attendance.create({ user: u._id, loginTime: new Date(yesterday.setHours(9,0,0)), logoutTime: new Date(yesterday.setHours(17,30,0)), durationSeconds: 8.5*3600 });
// //         await Attendance.create({ user: u._id, loginTime: new Date(today.setHours(9,15,0)), logoutTime: null });
// //       }
// //     }

// //     console.log("Seeding completed");
// //     process.exit(0);
// //   } catch (err) {
// //     console.error(err);
// //     process.exit(1);
// //   }
// // }

// // seed();









// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import User from "./models/User.js";

// dotenv.config();

// async function seed() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("Mongo connected");

//     // Admin
//     const adminEmail = "admin@tracknova.com";
//     const adminPass = "Admin123";
//     let admin = await User.findOne({ email: adminEmail });
//     if (!admin) {
//       admin = await User.create({
//         name: "Admin",
//         email: adminEmail,
//         password: await bcrypt.hash(adminPass, 10),
//         role: "admin",
//       });
//       console.log("Admin created:", adminEmail, adminPass);
//     }

//     // Superuser
//     const superEmail = "superuser@tracknova.com";
//     const superPass = "Super123";
//     let superuser = await User.findOne({ email: superEmail });
//     if (!superuser) {
//       superuser = await User.create({
//         name: "Superuser",
//         email: superEmail,
//         password: await bcrypt.hash(superPass, 10),
//         role: "superuser",
//       });
//       console.log("Superuser created:", superEmail, superPass);
//     }

//     console.log("Seeding completed");
//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// seed();






import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected");

    // Admin
    const adminEmail = "admin@tracknova.com";
    const adminPass = "Admin123";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPass, 10),
        role: "admin",
      });
      console.log("Admin created:", adminEmail, adminPass);
    }

    // Superuser
    const superEmail = "superuser@tracknova.com";
    const superPass = "Super123";
    let superuser = await User.findOne({ email: superEmail });
    if (!superuser) {
      superuser = await User.create({
        name: "Superuser",
        email: superEmail,
        password: await bcrypt.hash(superPass, 10),
        role: "superuser",
      });
      console.log("Superuser created:", superEmail, superPass);
    }

    // Default employees
    const employees = [
      { name: "Alice", email: "emp1@tracknova.com", password: "Employee123" },
      { name: "Bob", email: "emp2@tracknova.com", password: "Employee123" },
    ];

    for (const e of employees) {
      let emp = await User.findOne({ email: e.email });
      if (!emp) {
        emp = await User.create({
          name: e.name,
          email: e.email,
          password: await bcrypt.hash(e.password, 10),
          role: "employee",
        });
        console.log("Employee created:", e.email, e.password);
      }
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
