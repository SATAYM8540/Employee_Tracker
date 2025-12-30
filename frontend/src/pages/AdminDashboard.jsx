

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [captureModal, setCaptureModal] = useState({ open: false, data: null });
  const [historyModal, setHistoryModal] = useState({ open: false, data: null });
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role");

  // Fetch employees on load
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await client.get("/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const calculateDuration = (login, logout) => {
    if (!login || !logout) return "00h 00m";
    try {
      const diffMs = new Date(logout) - new Date(login);
      if (diffMs <= 0) return "00h 00m";
      const mins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${hrs}h ${rem}m`;
    } catch {
      return "00h 00m";
    }
  };

  // ✅ FIXED: Fetch Snapshots (uses correct backend route)
  const viewAllCaptures = async (emp) => {
    try {
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin/attendance/all-snapshots/${emp._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Prepend backend base URL to make full image URLs
      const baseURL = "http://localhost:5000";
      const captures = (res.data || []).map((c) => ({
        ...c,
        url: c.url.startsWith("http") ? c.url : `${baseURL}${c.url}`,
      }));

      setCaptureModal({ open: true, data: { employee: emp, captures } });
    } catch (err) {
      console.error(err);
      alert("Failed to load snapshots");
    }
  };

  // Delete snapshot (only for superuser)
  const deleteCapture = async (captureId) => {
    if (!window.confirm("Are you sure you want to delete this snapshot?")) return;
    try {
      const token = localStorage.getItem("token");
      await client.delete(
        `/admin/attendance/capture/${captureModal.data.employee._id}/${captureId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptureModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          captures: prev.data.captures.filter((c) => c._id !== captureId),
        },
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete snapshot");
    }
  };

  // Attendance History
  const viewHistory = async (emp) => {
    try {
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin/attendance/all-captures/${emp._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const historyData = (res.data || []).map((c) => ({
        loginTime: c.loginTime || c.timestamp || null,
        logoutTime: c.logoutTime || null,
        durationSeconds: c.durationSeconds || null,
      }));

      historyData.sort((a, b) => {
        const ta = a.loginTime ? new Date(a.loginTime).getTime() : 0;
        const tb = b.loginTime ? new Date(b.loginTime).getTime() : 0;
        return tb - ta;
      });

      setHistoryModal({ open: true, data: { employee: emp, history: historyData } });
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    }
  };

  return (
    <div className="container" style={{ padding: 20 }}>
      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#ea0f0f",
          color: "white",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Manager Dashboard</h2>
        <div>
          <button
            onClick={handleLogout}
            style={{
              background: "#e49c9c",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <h3>Employees</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
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
            <th>Snapshots</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const loginDate = emp.latestLogin ? new Date(emp.latestLogin).toLocaleDateString() : "-";
            const loginTime = emp.latestLogin ? new Date(emp.latestLogin).toLocaleTimeString() : "-";
            const logoutDate = emp.latestLogout ? new Date(emp.latestLogout).toLocaleDateString() : "-";
            const logoutTime = emp.latestLogout ? new Date(emp.latestLogout).toLocaleTimeString() : "-";

            return (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{loginDate}</td>
                <td>{loginTime}</td>
                <td>{logoutDate}</td>
                <td>{logoutTime}</td>
                <td>{calculateDuration(emp.latestLogin, emp.latestLogout)}</td>
                <td style={{ color: emp.status === "online" ? "green" : "gray", fontWeight: "bold" }}>
                  {emp.status}
                </td>
                <td>
                  <button
                    onClick={() => viewHistory(emp)}
                    style={{ background: "orange", color: "white", borderRadius: 4, padding: "4px 8px" }}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => viewAllCaptures(emp)}
                    style={{ background: "blue", color: "white", borderRadius: 4, padding: "4px 8px" }}
                  >
                    Snapshots
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* SNAPSHOT MODAL */}
      {captureModal.open && captureModal.data && (
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
              width: "85%",
              maxHeight: "85%",
              overflowY: "auto",
            }}
          >
            <h3>
              Snapshots - {captureModal.data.employee.name} ({captureModal.data.employee.email})
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "16px",
                marginTop: 20,
              }}
            >
              {captureModal.data.captures.length === 0 && (
                <p style={{ color: "gray" }}>No snapshots available.</p>
              )}

              {captureModal.data.captures.map((c) => (
                <div
                  key={c._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <p style={{ fontWeight: "bold", marginBottom: 4 }}>{captureModal.data.employee.name}</p>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
                    {captureModal.data.employee.email}
                  </p>
                  <p style={{ fontSize: "12px", color: "#555", marginBottom: 8 }}>
                    {new Date(c.timestamp).toLocaleString()}
                  </p>
                  <img
                    src={c.url}
                    alt="Snapshot"
                    loading="lazy"
                    style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: 6 }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  {userRole === "superuser" && (
                    <button
                      onClick={() => deleteCapture(c._id)}
                      style={{
                        marginTop: 8,
                        background: "red",
                        color: "white",
                        borderRadius: 6,
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setCaptureModal({ open: false, data: null })}
              style={{
                marginTop: 20,
                background: "red",
                color: "white",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyModal.open && historyModal.data && (
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
              width: "60%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>
              Login History - {historyModal.data.employee.name} ({historyModal.data.employee.email})
            </h3>
            <table
              border="1"
              cellPadding="6"
              style={{ borderCollapse: "collapse", width: "100%", marginTop: 10 }}
            >
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>Login Date</th>
                  <th>Login Time</th>
                  <th>Logout Date</th>
                  <th>Logout Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {historyModal.data.history.map((h, idx) => {
                  const login = h.loginTime ? new Date(h.loginTime) : null;
                  const logout = h.logoutTime ? new Date(h.logoutTime) : null;
                  let duration = "-";
                  if (login && logout) {
                    const diff = logout - login;
                    const mins = Math.floor(diff / 60000);
                    const hours = Math.floor(mins / 60);
                    duration = `${hours}h ${mins % 60}m`;
                  }
                  return (
                    <tr key={idx}>
                      <td>{login ? login.toLocaleDateString() : "-"}</td>
                      <td>{login ? login.toLocaleTimeString() : "-"}</td>
                      <td>{logout ? logout.toLocaleDateString() : "-"}</td>
                      <td>{logout ? logout.toLocaleTimeString() : "-"}</td>
                      <td>{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={() => setHistoryModal({ open: false, data: null })}
              style={{
                marginTop: 20,
                background: "red",
                color: "white",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
