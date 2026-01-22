

// // // import User from "../models/User.js";

// // // const seedSuperuser = async () => {
// // //   const exists = await User.findOne({ role: "superuser" });
// // //   if (exists) return;

// // //   const superuser = new User({
// // //     name: "Super User",
// // //     email: "superuser@tracknova.com",
// // //     password: "Super123",
// // //     role: "superuser",
// // //   });

// // //   await superuser.save();
// // //   console.log("✅ Default Superuser Created → superuser@tracknova.com / Super123");
// // // };

// // // export default seedSuperuser;


// import bcrypt from "bcryptjs";
// import User from "../models/User.js";

// const seedSuperuser = async () => {
//   const exists = await User.findOne({ role: "superuser" });
//   if (exists) {
//     console.log("ℹ️ Superuser already exists");
//     return;
//   }

//   const hashedPassword = await bcrypt.hash(
//     process.env.SUPERUSER_PASSWORD,
//     10
//   );

//   const superuser = new User({
//     name: process.env.SUPERUSER_NAME,
//     email: process.env.SUPERUSER_EMAIL,
//     password: hashedPassword,
//     role: "superuser",
//   });

//   await superuser.save();
//   // console.log("✅ Superuser created");
// };

// export default seedSuperuser;



// import bcrypt from "bcryptjs";
// import User from "../models/User.js";

// const seedSuperuser = async () => {
//   const exists = await User.findOne({ role: "superuser" });
//   if (exists) {
//     console.log("ℹ️ Superuser already exists");
//     return;
//   }

//   const hashedPassword = await bcrypt.hash(
//     process.env.SUPERUSER_PASSWORD,
//     10
//   );

//   await User.create({
//     name: process.env.SUPERUSER_NAME,
//     email: process.env.SUPERUSER_EMAIL,
//     password: hashedPassword,
//     role: "superuser",
//   });

//   console.log("✅ Superuser created");
// };

// export default seedSuperuser; // ✅ MUST exist


import User from "../models/User.js";

const seedSuperuser = async () => {
  const exists = await User.findOne({ role: "superuser" });
  if (exists) {
    console.log("ℹ️ Superuser already exists");
    return;
  }

  const superuser = new User({
    name: process.env.SUPERUSER_NAME,
    email: process.env.SUPERUSER_EMAIL,
    password: process.env.SUPERUSER_PASSWORD, // ✅ PLAIN TEXT
    role: "superuser",
  });

  await superuser.save(); // 🔐 pre("save") hashes it ONCE
  console.log("✅ Superuser created");
};

export default seedSuperuser;
