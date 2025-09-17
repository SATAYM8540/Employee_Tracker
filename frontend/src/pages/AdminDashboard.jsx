
import React, { useEffect, useState } from "react";
import client from "../api/client";
import VideoTile from "../components/VideoTile";
import { io } from "socket.io-client";

const socket = io("https://employee-tracker-5.onrender.com");

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
