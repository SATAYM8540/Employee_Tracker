

import React from "react";
import CameraTracker from "../components/CameraTracker";

export default function EmployeeHome() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="container">
      <h2 style={{ color: "#b30000" }}>
        Welcome, {localStorage.getItem("name")}
      </h2>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => window.location.href = "/history"}>
          Attendance History
        </button>
        <button onClick={handleLogout} style={{ marginLeft: 8 }}>
          Logout
        </button>
      </div>
      <div style={{ marginTop: 20 }}>
        <CameraTracker />
      </div>
    </div>
  );
}


