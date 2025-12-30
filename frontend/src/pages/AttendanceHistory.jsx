
import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function AttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Fetch attendance for this logged-in user
        const res = await client.get(`/admin/attendance/history/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLogs(res.data);
      } catch (err) {
        console.error("❌ Error fetching attendance:", err);
        if (err.response?.status === 403) {
          setError("Access denied — employees can only view their own history.");
        } else if (err.response?.status === 404) {
          setError("No attendance records found.");
        } else {
          setError("Failed to load attendance history.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2 style={{ color: "#b30000", marginBottom: "20px" }}>
        Your Attendance History
      </h2>

      {loading && <p>Loading attendance history...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <p style={{ color: "gray" }}>No attendance records found.</p>
      )}

      {!loading && logs.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Login</th>
              <th style={{ padding: "8px" }}>Logout</th>
              <th style={{ padding: "8px" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={{ padding: "8px" }}>
                  {log.loginTime
                    ? new Date(log.loginTime).toLocaleString()
                    : "-"}
                </td>
                <td style={{ padding: "8px" }}>
                  {log.logoutTime ? (
                    new Date(log.logoutTime).toLocaleString()
                  ) : (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Active
                    </span>
                  )}
                </td>
                <td style={{ padding: "8px" }}>
                  {formatDuration(log.durationSeconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
