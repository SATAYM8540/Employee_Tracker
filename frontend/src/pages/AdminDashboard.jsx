

// import React, { useEffect, useState } from "react";
// import client from "../api/client";
// import VideoTile from "../components/VideoTile";
// import { io } from "socket.io-client";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// const socket = io("http://localhost:5000");

// export default function AdminDashboard() {
//   const [employees, setEmployees] = useState([]);
//   const [activeSessions, setActiveSessions] = useState({});
//   const [now, setNow] = useState(Date.now());
//   const [history, setHistory] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);

//   useEffect(() => {
//     fetchEmployees();
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.id) socket.emit("register", { userId: user.id });

//     socket.on("user-status", ({ userId, status, lastLogin, lastLogout }) => {
//       setEmployees((prev) =>
//         prev.map((u) =>
//           String(u._id) === String(userId)
//             ? { ...u, status, latestLogin: lastLogin, latestLogout: lastLogout }
//             : u
//         )
//       );
//     });

//     return () => socket.off("user-status");
//   }, []);

//   // 🔹 Update "now" every 1 min for live duration
//   useEffect(() => {
//     const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const r = await client.get("/admin/employees");
//       setEmployees(r.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const startStream = (emp) => {
//     socket.emit("request-stream", {
//       employeeId: emp._id,
//       adminSocketId: socket.id,
//     });
//     setActiveSessions((prev) => ({
//       ...prev,
//       [emp._id]: true,
//     }));
//   };

//   const stopStream = (emp) => {
//     setActiveSessions((prev) => {
//       const c = { ...prev };
//       delete c[emp._id];
//       return c;
//     });
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     window.location.href = "/";
//   };

//   // 🔹 Duration calculator
//   const calculateDuration = (login, logout, status) => {
//     if (!login) return "-";

//     let endTime;
//     if (status === "online") {
//       endTime = now;
//     } else if (logout) {
//       endTime = new Date(logout);
//     } else {
//       return "-";
//     }

//     const diffMs = new Date(endTime) - new Date(login);
//     const minutes = Math.floor(diffMs / (1000 * 60));
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   // 🔹 Fetch attendance history for a user
//   const viewHistory = async (emp) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await client.get(`/admin/attendance/${emp._id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSelectedEmp(emp);
//       setHistory(res.data);
//     } catch (err) {
//       console.error("Error fetching history", err);
//       alert("Failed to load history");
//     }
//   };

//   // 🔹 Download weekly/monthly grouped Excel report
//   const downloadReport = async (range) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await client.get(`/admin/attendance/report?range=${range}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const logs = res.data;

//       // Group by employee
//       const grouped = {};
//       logs.forEach((log) => {
//         const uid = log.user._id;
//         if (!grouped[uid]) {
//           grouped[uid] = {
//             Name: log.user.name,
//             Email: log.user.email,
//             Role: log.user.role,
//             TotalSeconds: 0,
//             Sessions: [],
//           };
//         }
//         const duration = log.durationSeconds || 0;
//         grouped[uid].TotalSeconds += duration;
//         grouped[uid].Sessions.push({
//           Login: new Date(log.loginTime).toLocaleString(),
//           Logout: log.logoutTime
//             ? new Date(log.logoutTime).toLocaleString()
//             : "-",
//           Duration: `${Math.floor(duration / 3600)}h ${Math.floor(
//             (duration % 3600) / 60
//           )}m`,
//         });
//       });

//       // Flatten for Excel
//       const data = [];
//       Object.values(grouped).forEach((emp) => {
//         data.push({
//           Name: emp.Name,
//           Email: emp.Email,
//           Role: emp.Role,
//           "Total Time": `${Math.floor(emp.TotalSeconds / 3600)}h ${Math.floor(
//             (emp.TotalSeconds % 3600) / 60
//           )}m`,
//         });
//         data.push({ Name: "---- Sessions ----" });

//         emp.Sessions.forEach((s) =>
//           data.push({
//             Login: s.Login,
//             Logout: s.Logout,
//             Duration: s.Duration,
//           })
//         );

//         data.push({});
//       });

//       const worksheet = XLSX.utils.json_to_sheet(data);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

//       const excelBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array",
//       });
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       saveAs(blob, `attendance_${range}_${Date.now()}.xlsx`);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="container">
//       <h2 style={{ color: "#b30000" }}>Admin Dashboard</h2>

//       {/* Admin Logout Button */}
//       <button
//         onClick={handleLogout}
//         style={{
//           background: "red",
//           color: "white",
//           padding: "8px 16px",
//           border: "none",
//           marginBottom: "20px",
//           cursor: "pointer",
//         }}
//       >
//         Logout
//       </button>

//       {/* Report Download Buttons */}
//       <div style={{ marginBottom: "20px" }}>
//         <button
//           onClick={() => downloadReport("week")}
//           style={{
//             margin: "10px",
//             padding: "8px 14px",
//             background: "orange",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//           }}
//         >
//           ⬇ Weekly Report (Excel)
//         </button>

//         <button
//           onClick={() => downloadReport("month")}
//           style={{
//             margin: "10px",
//             padding: "8px 14px",
//             background: "purple",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//           }}
//         >
//           ⬇ Monthly Report (Excel)
//         </button>
//       </div>

//       <h3>Employees</h3>
//       <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ background: "#f2f2f2" }}>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Role</th>
//             <th>Login Date</th>
//             <th>Login Time</th>
//             <th>Logout Date</th>
//             <th>Logout Time</th>
//             <th>Duration</th>
//             <th>Status</th>
//             <th>History</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees.map((emp) => {
//             const loginDate = emp.latestLogin
//               ? new Date(emp.latestLogin).toLocaleDateString()
//               : "-";
//             const loginTime = emp.latestLogin
//               ? new Date(emp.latestLogin).toLocaleTimeString()
//               : "-";
//             const logoutDate = emp.latestLogout
//               ? new Date(emp.latestLogout).toLocaleDateString()
//               : "-";
//             const logoutTime = emp.latestLogout
//               ? new Date(emp.latestLogout).toLocaleTimeString()
//               : "-";

//             return (
//               <tr key={emp._id}>
//                 <td>{emp.name}</td>
//                 <td>{emp.email}</td>
//                 <td>{emp.role}</td>
//                 <td>{loginDate}</td>
//                 <td>{loginTime}</td>
//                 <td>{logoutDate}</td>
//                 <td>{logoutTime}</td>
//                 <td>
//                   {calculateDuration(
//                     emp.latestLogin,
//                     emp.latestLogout,
//                     emp.status
//                   )}
//                 </td>
//                 <td
//                   style={{
//                     color: emp.status === "online" ? "green" : "gray",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {emp.status}
//                 </td>
//                 <td>
//                   <button
//                     onClick={() => viewHistory(emp)}
//                     style={{
//                       background: "blue",
//                       color: "white",
//                       border: "none",
//                       padding: "4px 8px",
//                       cursor: "pointer",
//                       borderRadius: "4px",
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {/* 🔹 History Modal */}
//       {selectedEmp && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0,0,0,0.6)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <div
//             style={{
//               background: "white",
//               padding: 20,
//               borderRadius: 8,
//               width: "80%",
//               maxHeight: "80%",
//               overflowY: "auto",
//             }}
//           >
//             <h3>
//               Attendance History - {selectedEmp.name} ({selectedEmp.email})
//             </h3>
//             <table
//               border="1"
//               cellPadding="6"
//               style={{ width: "100%", borderCollapse: "collapse" }}
//             >
//               <thead>
//                 <tr>
//                   <th>Login Date</th>
//                   <th>Login Time</th>
//                   <th>Logout Date</th>
//                   <th>Logout Time</th>
//                   <th>Duration</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.map((h) => {
//                   const loginDate = new Date(h.loginTime).toLocaleDateString();
//                   const loginTime = new Date(h.loginTime).toLocaleTimeString();
//                   const logoutDate = h.logoutTime
//                     ? new Date(h.logoutTime).toLocaleDateString()
//                     : "-";
//                   const logoutTime = h.logoutTime
//                     ? new Date(h.logoutTime).toLocaleTimeString()
//                     : "-";
//                   const duration = h.durationSeconds
//                     ? `${Math.floor(h.durationSeconds / 3600)}h ${Math.floor(
//                         (h.durationSeconds % 3600) / 60
//                       )}m`
//                     : "-";
//                   return (
//                     <tr key={h._id}>
//                       <td>{loginDate}</td>
//                       <td>{loginTime}</td>
//                       <td>{logoutDate}</td>
//                       <td>{logoutTime}</td>
//                       <td>{duration}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <button
//               onClick={() => setSelectedEmp(null)}
//               style={{
//                 marginTop: 10,
//                 background: "red",
//                 color: "white",
//                 padding: "6px 12px",
//                 border: "none",
//                 borderRadius: 6,
//                 cursor: "pointer",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <h3 style={{ marginTop: 20 }}>Live Grid</h3>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, 320px)",
//           gap: 12,
//         }}
//       >
//         {employees.map((emp) => (
//           <div key={emp._id} style={{ textAlign: "center" }}>
//             <VideoTile emp={emp} />
//             {!activeSessions[emp._id] ? (
//               <button
//                 onClick={() => startStream(emp)}
//                 style={{
//                   marginTop: "6px",
//                   background: "green",
//                   color: "white",
//                   padding: "4px 8px",
//                   border: "none",
//                   cursor: "pointer",
//                   borderRadius: "4px",
//                 }}
//               >
//                 Start Stream
//               </button>
//             ) : (
//               <button
//                 onClick={() => stopStream(emp)}
//                 style={{
//                   marginTop: "6px",
//                   background: "red",
//                   color: "white",
//                   padding: "4px 8px",
//                   border: "none",
//                   cursor: "pointer",
//                   borderRadius: "4px",
//                 }}
//               >
//                 Stop Stream
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import client from "../api/client";
import VideoTile from "../components/VideoTile";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [activeSessions, setActiveSessions] = useState({});
  const [now, setNow] = useState(Date.now());
  const [history, setHistory] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    fetchEmployees();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) socket.emit("register", { userId: user.id });

    socket.on("user-status", ({ userId, status, lastLogin, lastLogout }) => {
      setEmployees((prev) =>
        prev.map((u) =>
          String(u._id) === String(userId)
            ? { ...u, status, latestLogin: lastLogin, latestLogout: lastLogout }
            : u
        )
      );
    });

    return () => socket.off("user-status");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployees = async () => {
    try {
      const r = await client.get("/admin/employees");
      setEmployees(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const startStream = (emp) => {
    socket.emit("request-stream", {
      employeeId: emp._id,
      adminSocketId: socket.id,
    });
    setActiveSessions((prev) => ({
      ...prev,
      [emp._id]: true,
    }));
  };

  const stopStream = (emp) => {
    setActiveSessions((prev) => {
      const c = { ...prev };
      delete c[emp._id];
      return c;
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // 🔹 Back button handler
  const handleBack = () => {
    window.history.back();
  };

  const calculateDuration = (login, logout, status) => {
    if (!login) return "-";

    let endTime;
    if (status === "online") {
      endTime = now;
    } else if (logout) {
      endTime = new Date(logout);
    } else {
      return "-";
    }

    const diffMs = new Date(endTime) - new Date(login);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const viewHistory = async (emp) => {
    try {
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin/attendance/${emp._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmp(emp);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
      alert("Failed to load history");
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: "#b30000" }}>Admin Dashboard</h2>

      {/* 🔹 Back Button with SVG Icon */}
      <button
        onClick={handleBack}
        style={{
          background: "#444",
          color: "white",
          padding: "8px 12px",
          border: "none",
          marginBottom: "10px",
          cursor: "pointer",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Go Back"
      >
        {/* Back Arrow SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* 🔹 Admin Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          background: "red",
          color: "white",
          padding: "8px 16px",
          border: "none",
          marginLeft: "10px",
          marginBottom: "20px",
          cursor: "pointer",
          borderRadius: "6px",
        }}
      >
        Logout
      </button>

      {/* 🔹 Employee Table */}
      <h3>Employees</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Login Date</th>
            <th>Login Time</th>
            <th>Logout Date</th>
            <th>Logout Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const loginDate = emp.latestLogin
              ? new Date(emp.latestLogin).toLocaleDateString()
              : "-";
            const loginTime = emp.latestLogin
              ? new Date(emp.latestLogin).toLocaleTimeString()
              : "-";
            const logoutDate = emp.latestLogout
              ? new Date(emp.latestLogout).toLocaleDateString()
              : "-";
            const logoutTime = emp.latestLogout
              ? new Date(emp.latestLogout).toLocaleTimeString()
              : "-";

            return (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{loginDate}</td>
                <td>{loginTime}</td>
                <td>{logoutDate}</td>
                <td>{logoutTime}</td>
                <td>
                  {calculateDuration(
                    emp.latestLogin,
                    emp.latestLogout,
                    emp.status
                  )}
                </td>
                <td
                  style={{
                    color: emp.status === "online" ? "green" : "gray",
                    fontWeight: "bold",
                  }}
                >
                  {emp.status}
                </td>
                <td>
                  <button
                    onClick={() => viewHistory(emp)}
                    style={{
                      background: "blue",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 🔹 History Modal */}
      {selectedEmp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: "80%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>
              Attendance History - {selectedEmp.name} ({selectedEmp.email})
            </h3>
            <table
              border="1"
              cellPadding="6"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Login Date</th>
                  <th>Login Time</th>
                  <th>Logout Date</th>
                  <th>Logout Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => {
                  const loginDate = new Date(h.loginTime).toLocaleDateString();
                  const loginTime = new Date(h.loginTime).toLocaleTimeString();
                  const logoutDate = h.logoutTime
                    ? new Date(h.logoutTime).toLocaleDateString()
                    : "-";
                  const logoutTime = h.logoutTime
                    ? new Date(h.logoutTime).toLocaleTimeString()
                    : "-";
                  const duration = h.durationSeconds
                    ? `${Math.floor(h.durationSeconds / 3600)}h ${Math.floor(
                        (h.durationSeconds % 3600) / 60
                      )}m`
                    : "-";
                  return (
                    <tr key={h._id}>
                      <td>{loginDate}</td>
                      <td>{loginTime}</td>
                      <td>{logoutDate}</td>
                      <td>{logoutTime}</td>
                      <td>{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={() => setSelectedEmp(null)}
              style={{
                marginTop: 10,
                background: "red",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>Live Grid</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 320px)",
          gap: 12,
        }}
      >
        {employees.map((emp) => (
          <div key={emp._id} style={{ textAlign: "center" }}>
            <VideoTile emp={emp} />
            {!activeSessions[emp._id] ? (
              <button
                onClick={() => startStream(emp)}
                style={{
                  marginTop: "6px",
                  background: "green",
                  color: "white",
                  padding: "4px 8px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Start Stream
              </button>
            ) : (
              <button
                onClick={() => stopStream(emp)}
                style={{
                  marginTop: "6px",
                  background: "red",
                  color: "white",
                  padding: "4px 8px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Stop Stream
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
