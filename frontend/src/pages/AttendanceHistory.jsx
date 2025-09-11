import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function AttendanceHistory() {
  const [logs,setLogs] = useState([]);
  useEffect(()=> { client.get("/track/history").then(res=>setLogs(res.data)).catch(()=>{}); }, []);
  return (
    <div className="container">
      <h2 style={{color:'#b30000'}}>Your Attendance History</h2>
      <table>
        <thead><tr><th>Login</th><th>Logout</th><th>Duration</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id}>
              <td>{new Date(l.loginTime).toLocaleString()}</td>
              <td>{l.logoutTime ? new Date(l.logoutTime).toLocaleString() : "Active"}</td>
              <td>{l.durationSeconds ? `${Math.floor(l.durationSeconds/3600)}h ${Math.floor((l.durationSeconds%3600)/60)}m` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
