// // import React, { useEffect, useState } from "react";
// // import client from "../api/client";

// // function AdminDashboard() {
// //   const [employees, setEmployees] = useState([]);
// //   const [logs, setLogs] = useState([]);

// //   useEffect(() => {
// //     client.get("/admin/employees").then((res) => setEmployees(res.data));
// //     client.get("/admin/attendance").then((res) => setLogs(res.data));
// //   }, []);

// //   return (
// //     <div className="container">
// //       <h2>Admin Dashboard</h2>

// //       <h3>Employees</h3>
// //       <ul>
// //         {employees.map((emp) => (
// //           <li key={emp._id}>{emp.name} ({emp.email})</li>
// //         ))}
// //       </ul>

// //       <h3>Attendance Logs</h3>
// //       <table>
// //         <thead>
// //           <tr>
// //             <th>Employee</th>
// //             <th>Login</th>
// //             <th>Logout</th>
// //             <th>Status</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {logs.map((log) => (
// //             <tr key={log._id} className={log.logoutTime ? "completed" : "active"}>
// //               <td>{log.user.name}</td>
// //               <td>{new Date(log.loginTime).toLocaleString()}</td>
// //               <td>{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : "Active"}</td>
// //               <td>{log.logoutTime ? "Completed" : "Active"}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // export default AdminDashboard;




// import React, { useEffect, useState } from "react";
// import client from "../api/client";
// import VideoStream from "../components/VideoStream";

// function AdminDashboard() {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   useEffect(() => {
//     client.get("/admin/employees").then((res) => setEmployees(res.data));
//   }, []);

//   return (
//     <div className="container">
//       <h2>Admin Dashboard</h2>

//       <h3>Employees</h3>
//       <ul>
//         {employees.map((emp) => (
//           <li key={emp._id}>
//             {emp.name} ({emp.email}) 
//             <button onClick={() => setSelectedEmployee(emp._id)}>Request Stream</button>
//           </li>
//         ))}
//       </ul>

//       {selectedEmployee && <VideoStream employeeId={selectedEmployee} />}
//     </div>
//   );
// }

// export default AdminDashboard;



import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState({}); // store active sessions

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartStream = async (empId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/stream/start",
        { employeeId: empId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions((prev) => ({ ...prev, [empId]: res.data.session._id }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopStream = async (empId) => {
    try {
      const token = localStorage.getItem("token");
      const sessionId = sessions[empId];
      await axios.post(
        "http://localhost:5000/api/stream/stop",
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions((prev) => {
        const copy = { ...prev };
        delete copy[empId];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-red-500">
          <thead>
            <tr className="bg-red-500 text-white">
              <th className="px-4 py-2 border">Employee Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Login Date & Time</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="text-center">
                <td className="px-4 py-2 border">{emp.name}</td>
                <td className="px-4 py-2 border">{emp.email}</td>
                <td className="px-4 py-2 border capitalize">{emp.role}</td>
                <td className="px-4 py-2 border">
                  {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : "Never"}
                </td>
                <td
                  className={`px-4 py-2 border font-semibold ${
                    emp.status === "online" ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {emp.status}
                </td>
                <td className="px-4 py-2 border space-x-2">
                  {!sessions[emp._id] ? (
                    <button
                      onClick={() => handleStartStream(emp._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Start Stream
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStopStream(emp._id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Stop Stream
                    </button>
                  )}
                  <button className="bg-white text-black px-3 py-1 rounded">
                    Back
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
