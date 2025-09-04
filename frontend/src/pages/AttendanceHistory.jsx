import React, { useEffect, useState } from "react";
import client from "../api/client";

function AttendanceHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    client.get("/track/history").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="container">
      <h2>Attendance History</h2>
      <table>
        <thead>
          <tr>
            <th>Login</th>
            <th>Logout</th>
            <th>Duration (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.loginTime).toLocaleString()}</td>
              <td>{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : "Active"}</td>
              <td>{log.durationSeconds ? (log.durationSeconds / 3600).toFixed(2) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistory;
