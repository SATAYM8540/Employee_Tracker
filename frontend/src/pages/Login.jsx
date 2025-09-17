


// // import React, { useState } from "react";
// // import client from "../api/client";

// // export default function Login() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [err, setErr] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const res = await client.post("/auth/login", { email, password });
// //       const { token, user } = res.data;

// //       localStorage.setItem("token", token);
// //       localStorage.setItem("role", user.role);
// //       localStorage.setItem("name", user.name);
// //       localStorage.setItem(
// //         "user",
// //         JSON.stringify({ id: user.id, name: user.name, role: user.role })
// //       );

// //       if (user.role === "admin") window.location.href = "/admin";
// //       else window.location.href = "/employee";
// //     } catch (err) {
// //       setErr(err.response?.data?.error || "Login failed");
// //     }
// //     setLoading(false);
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 px-4">
// //       <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
// //         {/* Logo */}
// //         <div className="flex justify-center mb-6">
// //           <img
// //             src="/trackNova1.png"
// //             alt="TrackNova Logo"
// //             className="w-32 h-32 object-contain"
// //           />
// //         </div>

// //         <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
// //           TrackNova Login
// //         </h2>

// //         {/* Error message */}
// //         {err && (
// //           <p className="text-center text-red-600 mb-4 text-sm">{err}</p>
// //         )}

// //         {/* Login form */}
// //         <form onSubmit={handleSubmit} className="flex flex-col gap-5">
// //           <input
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             placeholder="Email"
// //             type="email"
// //             required
// //             className="border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 text-gray-700"
// //           />

// //           <div className="relative">
// //             <input
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               placeholder="Password"
// //               type={showPassword ? "text" : "password"}
// //               required
// //               className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 text-gray-700"
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword(!showPassword)}
// //               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
// //             >
// //               {showPassword ? "Hide" : "Show"}
// //             </button>
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
// //           >
// //             {loading ? "Logging in..." : "Login"}
// //           </button>
// //         </form>

// //         {/* Admin/Employee hints */}
// //         <div className="mt-6 text-center text-red-700 text-sm space-y-1">
// //           <p>Admin: admin@tracknova.com / Admin123</p>
// //           <p>Employee: emp1@tracknova.com / Employee123</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }




// import React, { useState } from "react";
// import client from "../api/client";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await client.post("/auth/login", { email, password });
//       const { token, user } = res.data;

//       localStorage.setItem("token", token);
//       localStorage.setItem("role", user.role);
//       localStorage.setItem("name", user.name);
//       localStorage.setItem(
//         "user",
//         JSON.stringify({ id: user.id, name: user.name, role: user.role })
//       );

//       if (user.role === "admin") window.location.href = "/admin";
//       else window.location.href = "/employee";
//     } catch (err) {
//       setErr(err.response?.data?.error || "Login failed");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 px-4">
//       {/* Card */}
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 flex flex-col items-center text-center animate-fadeIn">
//         {/* Logo */}
//         <img
//           src="/trackNova1.png"
//           alt="TrackNova Logo"
//           className="w-24 h-24 object-contain mb-4"
//         />

//         <h2 className="text-2xl font-bold text-red-700 mb-6">TrackNova Login</h2>

//         {/* Error */}
//         {err && <p className="text-red-600 mb-4 text-sm">{err}</p>}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
//           <input
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email"
//             type="email"
//             required
//             className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-gray-700"
//           />

//           <div className="relative">
//             <input
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Password"
//               type={showPassword ? "text" : "password"}
//               required
//               className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-gray-700"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {/* Demo credentials */}
//         <div className="mt-6 text-red-700 text-sm space-y-1">
//           <p>Admin: <span className="font-medium">admin@tracknova.com / Admin123</span></p>
//           <p>Employee: <span className="font-medium">emp1@tracknova.com / Employee123</span></p>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import client from "../api/client";
import "./Login.css"; // Import CSS file

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: user.id, name: user.name, role: user.role })
      );

      if (user.role === "admin") window.location.href = "/admin";
      else window.location.href = "/employee";
    } catch (err) {
      setErr(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <img src="/trackNova1.png" alt="TrackNova Logo" className="logo" />

        <h2 className="title">TrackNova Login</h2>

        {/* Error */}
        {err && <p className="error">{err}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />

          <div className="password-field">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-btn"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-creds">
          <p>Admin: admin@tracknova.com / Admin123</p>
          <p>Employee: emp1@tracknova.com / Employee123</p>
        </div>
      </div>
    </div>
  );
}
